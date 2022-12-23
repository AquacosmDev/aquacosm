import { Injectable, OnDestroy } from '@angular/core';
import { ChartData } from '@shr//models/chart-data.model';
import { MesocosmDataService } from '@core/collections/mesocosm-data.service';
import {
  BehaviorSubject,
  buffer,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  take, takeUntil,
  tap
} from 'rxjs';
import { MesocosmData, TimePoint } from '@shr//models/mesocosm-data.model';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { Mesocosm } from '@shr//models/mesocosm.model';
import { DateService } from '@core/date.service';
import { IsSelectedService } from '@core/is-selected.service';
import { MesocosmYearDataService } from '@core/collections/mesocosm-year-data.service';
import { MesocosmYearData } from '@shr/models/mesocosm-year-data.model';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService implements OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private alreadyRequesting$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private queue: string[] = [];

  constructor(private mesocosmDataService: MesocosmDataService, private mesocosmService: MesocosmService,
              private dateService: DateService, private isSelectedService: IsSelectedService,
              private mesocosmYearDataService: MesocosmYearDataService) { }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.alreadyRequesting$.complete();
    this.alreadyRequesting$ = null;
  }

  public getChartData(variableId: string): Observable<ChartData[]> {
    return this.getChartDataForVariableMesocosmsAndDays(variableId)
      .pipe(switchMap(mesocosmData => this.mesocosmDataToChartData(mesocosmData)));
  }

  public getLatestData(variableId: string, mesocosmId: string, numberOfExistingTimepoints: number): Observable<TimePoint[]> {
    return this.mesocosmDataService.getMesocosmDataForToday(variableId, mesocosmId)
      .pipe(map(mesocosmData => this.getMissingTimepoints(mesocosmData, numberOfExistingTimepoints)));
  }

  public downloadData(variableId: string, mesocosms: Mesocosm[], days: number[]): Observable<MesocosmData[]> {
    return this.getChartDataForVariableMesocosmsAndDays(variableId, mesocosms, days);

  }

  private getChartDataForVariableMesocosmsAndDays(variableId: string, mesocosms?: Mesocosm[], days?: number[]): Observable<MesocosmData[]> {
    const getMesocosmAndDays = !mesocosms ?
      this.isSelectedService.getMesocosmsAndDays() :
      of({ mesocosmIds: mesocosms.map(mesocosm => mesocosm.id), days: days });

    return getMesocosmAndDays
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => this.inQueue(variableId)),
        buffer(this.isOpen(variableId)),
        switchMap(() => getMesocosmAndDays.pipe(take(1))),
        switchMap(isSelected => this.getMesocosmDataByDayOrByMinute(variableId, isSelected)),
        tap(() => this.next()),
      );
  }

  private mesocosmDataToChartData(mesocosmData: MesocosmData[]): Observable<ChartData[]> {
    return this.getMesocosmsForMesocosmData(this.getMesocosmDataByMesocosm(mesocosmData))
      .pipe(map(result => this.combineMesocosmsAndData(result)));
  }

  private getMesocosmsForMesocosmData(mesocosmData: MesocosmData[]): Observable<{ mesocosms: Mesocosm[], data: MesocosmData[] }> {
    const observable = mesocosmData.length === 0 ? of([] as Mesocosm[]) : forkJoin(mesocosmData.map(mesocosmData => this.mesocosmService.get(mesocosmData.mesocosmId).pipe(take(1))));
    return observable
      .pipe(map(mesocoms => { return { mesocosms: mesocoms, data: mesocosmData} }));
  }

  private combineMesocosmsAndData(result: { mesocosms: Mesocosm[], data: MesocosmData[] }): ChartData[] {
    return result.data.length === 0 ?
      [] :
      result.mesocosms.map(mesocosm => this.mesocosmToChartData(mesocosm, result.data.find(data => data.mesocosmId === mesocosm.id)!));
  }

  private mesocosmToChartData(mesocosm: Mesocosm, mesocosmData: MesocosmData): ChartData {
    return {
      label: mesocosm.name,
      data: mesocosmData.data,
      mesocosmId: mesocosm.id!,
      variableId: mesocosmData.variableId
    }
  }

  private getMesocosmDataByMesocosm(mesocosmData: MesocosmData[]): MesocosmData[] {
    const mesocosmIds = [...new Set(mesocosmData.map(data => data.mesocosmId))];

    return mesocosmIds.map(mesocosmId => this.mergeMesocosmsData(mesocosmData.filter(data => data.mesocosmId === mesocosmId)));
  }

  private mergeMesocosmsData(mesocosmData: MesocosmData[]): MesocosmData | MesocosmYearData {
    const initialValue = this.createEmptyMesocosmData(mesocosmData[ 0 ]);
    return mesocosmData.reduce(
      (previousValue, currentValue) => {
        previousValue.data = previousValue.data.concat(currentValue.data);
        return previousValue;
      }, initialValue);
  }

  private createEmptyMesocosmData(mesocosmData: MesocosmData | MesocosmYearData): MesocosmData | MesocosmYearData {
    const newData = { ...mesocosmData };
    newData.data = [];
    return newData;
  }

  private getMissingTimepoints(mesocosmData: MesocosmData, numberOfExistingTimepoints: number): TimePoint[] {
    const filteredData = [ ...mesocosmData.data ].filter(point => !!point.value);
    return filteredData.slice(filteredData.length - (filteredData.length - numberOfExistingTimepoints));
  }

  private isOpen(variableId: string): Observable<string> {
    return this.alreadyRequesting$.asObservable().pipe(
      filter(next => next === variableId));
  }

  private inQueue(variableId: string) {
    this.queue.push(variableId);
    if (this.alreadyRequesting$.getValue() === '' && this.queue.length === 1) {
      this.alreadyRequesting$.next(this.queue.shift());
    }
  }

  private next() {
    this.alreadyRequesting$.next(this.queue.length > 0 ? this.queue.shift() : '');
  }

  private daysToYear(days: number[]): number[] {
    return [ ...new Set(days.map(day => parseInt(('' + day).slice(0, 4)))) ];
  }

  private getMesocosmDataByDayOrByMinute(variableId: string, isSelected: { mesocosmIds: string[], days: number[] }): Observable<MesocosmData[]> {
    return isSelected.days.length > 30 ?
      this.mesocosmYearDataService.getMesocosmsYearData(variableId, isSelected.mesocosmIds, this.daysToYear(isSelected.days)) :
      this.mesocosmDataService.getMesocosmsData(variableId, isSelected.mesocosmIds, isSelected.days);
  }
}
