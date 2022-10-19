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
import { DateRange } from '@shr/models/date-range.model';
import { DateService } from '@core/date.service';
import { IsSelectedService } from '@core/is-selected.service';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService implements OnDestroy {
  private data: { [ dataId: string ]: MesocosmData } = {};
  private inData: { [ variableId: string ]: { [ mesocosmId: string ]: number[] }} = {};
  private charts$: { [variableId: string ]: BehaviorSubject<ChartData[]> } = {};

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private alreadyRequesting$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private queue: string[] = [];

  constructor(private mesocosmDataService: MesocosmDataService, private mesocosmService: MesocosmService,
              private dateService: DateService, private isSelectedService: IsSelectedService) { }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.alreadyRequesting$.complete();
    this.alreadyRequesting$ = null;
  }

  public getChartData(variableId: string): Observable<ChartData[]> {
    const observable = !!this.charts$[ variableId ] ?
      this.getVariableChart(variableId) : this.initChartData(variableId);

    return observable.pipe(filter(chartData => !!chartData && chartData.length > 0));
  }

  public getLatestData(variableId: string, mesocosmId: string): Observable<TimePoint[]> {
    return this.mesocosmDataService.getMesocosmDataForToday(variableId, mesocosmId)
      .pipe(map(mesocosmData => this.updateStore(mesocosmData)))
  }

  public downloadData(variableId: string, mesocosms: Mesocosm[], days: number[]): Observable<MesocosmData[]> {
    return this.getChartDataForVariableMesocosmsAndDays(variableId, mesocosms, days)
      .pipe(
        tap(mesocosmData => mesocosmData.forEach(data => this.addMescosmsDataToStore(data))),
        map(() => this.getRawMesocosmDataFromStore(variableId, mesocosms, days)));

  }

  private initChartData(variableId: string): Observable<ChartData[]> {
    this.charts$[ variableId ] = new BehaviorSubject<ChartData[]>([]);
    this.getChartDataForVariable(variableId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.charts$[ variableId ].next(data);
      })
    return this.getVariableChart(variableId);
  }

  public getChartDataForVariable(variableId: string): Observable<ChartData[]> {
    return this.getChartDataForVariableMesocosmsAndDays(variableId)
      .pipe(
        tap(mesocosmData => mesocosmData.forEach(data => this.addMescosmsDataToStore(data))),
        switchMap(() => this.mesocosmDataFromStoreToChartData(variableId)));
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
        switchMap(isSelected => this.getMesocosmsData(variableId, isSelected.mesocosmIds, isSelected.days)),
        tap(() => this.next()),
      );
  }

  private mesocosmDataFromStoreToChartData(variableId: string): Observable<ChartData[]> {
    return this.combineMesocosmData(variableId)
      .pipe(
        switchMap(mesocosmData => this.getMesocosmsForMesocosmData(mesocosmData)),
        map(result => this.combineMesocosmsAndData(result)));
  }

  private getMesocosmsForMesocosmData(mesocosmData: MesocosmData[]): Observable<{ mesocosms: Mesocosm[], data: MesocosmData[] }> {
    return forkJoin(mesocosmData.map(mesocosmData => this.mesocosmService.get(mesocosmData.mesocosmId).pipe(take(1))))
      .pipe(map(mesocoms => { return { mesocosms: mesocoms, data: mesocosmData} }));
  }

  private combineMesocosmsAndData(result: { mesocosms: Mesocosm[], data: MesocosmData[] }): ChartData[] {
    return result.mesocosms.map(mesocosm => this.mesocosmToChartData(mesocosm, result.data.find(data => data.mesocosmId === mesocosm.id)!));
  }

  private mesocosmToChartData(mesocosm: Mesocosm, mesocosmData: MesocosmData): ChartData {
    return {
      label: mesocosm.name,
      data: mesocosmData.data,
      mesocosmId: mesocosm.id!,
      variableId: mesocosmData.variableId
    }
  }

  private getVariableChart(variableId: string): Observable<ChartData[]> {
    return this.charts$[ variableId ].asObservable();
  }

  private combineMesocosmData(variableId: string): Observable<MesocosmData[]> {
    return this.isSelectedService.getMesocosmsAndDays()
      .pipe(take(1), switchMap(isSelected =>
        this.getMesocosmDataByMesocosm(variableId, isSelected.mesocosmIds, isSelected.days)));
  }

  private getMesocosmDataByMesocosm(variableId: string, mesocosmIds: string[], days: number[]): Observable<MesocosmData[]> {
    return this.isSelectedService.getDateRange()
      .pipe(take(1), map(dateRange => mesocosmIds.map(mesocosmId => this.mergeMesocosmsData(variableId, mesocosmId, days, dateRange))));
  }

  private mergeMesocosmsData(variableId: string, mesocosmId: string, days: number[], dateRange: DateRange): MesocosmData {
    const mesocosmData = this.getMesocosmDataFromStore(variableId, mesocosmId, days);

    mesocosmData.forEach(data => {
      if (!!data.data) {
        data.data = this.filterTimePoints(data.data, dateRange);
      }
    });
    const initialValue = this.createEmptyMesocosmData(mesocosmData[ 0 ]);
    return mesocosmData.reduce(
      (previousValue, currentValue) => {
        previousValue.data = previousValue.data.concat(currentValue.data);
        return previousValue;
      }, initialValue);
  }

  private getMesocosmDataFromStore(variableId: string, mesocosmIds: string, days: number[]): MesocosmData[] {
    return days.map(day => { return { ...this.data[ this.createDataId(variableId, mesocosmIds, day) ] } }).filter(data => !!data);
  }

  private addMescosmsDataToStore(mesocosmData: MesocosmData) {
    this.data[ this.createDataId(mesocosmData.variableId, mesocosmData.mesocosmId, mesocosmData.day) ] = mesocosmData;
    if(!this.inData[ mesocosmData.variableId ]) {
      this.inData[ mesocosmData.variableId ] = {};
    }
    if(!this.inData[ mesocosmData.variableId ][ mesocosmData.mesocosmId ]) {
      this.inData[ mesocosmData.variableId ][ mesocosmData.mesocosmId ] = [];
    }
    this.inData[ mesocosmData.variableId ][ mesocosmData.mesocosmId ].push(mesocosmData.day);
  }

  private createDataId(variableId: string, mesocosmId: string, day: number): string {
    return `${variableId}-${mesocosmId}-${day};`
  }

  private createEmptyMesocosmData(mesocosmData: MesocosmData): MesocosmData {
    const newData = { ...mesocosmData };
    newData.data = [];
    return newData;
  }

  private filterTimePoints(data: TimePoint[], dateRange: DateRange): TimePoint[] {
    const differenceInMinutes = this.dateService.getDifferenceInMinutes(dateRange);
    let newData: TimePoint[] = [];
    if(differenceInMinutes < 180) {
      newData = data.filter(point => this.dateService.isInRange(point.time, dateRange));
    } else {
      for (let index = 0; index < data.length; index= index + 60) {
        if (this.dateService.isInRange(data[ index ].time, dateRange)) {
          newData.push(data[index]);
        }
      }
    }
    return newData;
  }

  private getMesocosmsData(variableId: string, mesocosmIds: string[], days: number[]): Observable<MesocosmData[]> {
    return this.mesocosmDataService.getMesocosmsData(variableId, this.determineMissingData(variableId, mesocosmIds, days))
      .pipe(take(1));
  }

  private determineMissingData(variableId: string, mesocosmIds: string[], days: number[]): { [mesocosmId: string]: number[] } {
    const missingData: { [mesocosmId: string]: number[] } = {};
    mesocosmIds.forEach(mesocosmId => {
      days.filter(day => !this.inData[ variableId ] ? !this.inData[ variableId ] : this.inData[ variableId ][ mesocosmId ]?.includes(day));
      if(days.length > 0) {
        missingData[ mesocosmId ] = days;
      }
    });

    return missingData;
  }

  private updateStore(mesocosmData: MesocosmData): TimePoint[] {
    const storeData = this.data[ this.createDataId(mesocosmData.variableId, mesocosmData.mesocosmId, mesocosmData.day) ].data;
    const filteredStoreData = storeData.filter((point, index) => point.value !== null);
    const filteredData = [ ...mesocosmData.data ].filter(point => !!point.value);
    const newTimepoints = filteredData.slice(filteredData.length - (filteredData.length - filteredStoreData.length));
    this.data[ this.createDataId(mesocosmData.variableId, mesocosmData.mesocosmId, mesocosmData.day) ] = mesocosmData;
    return newTimepoints;
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

  private getRawMesocosmDataFromStore(variableId: string, mesocosms: Mesocosm[], days: number[]): MesocosmData[] {
    const mesocosmData: MesocosmData[] = [];
    mesocosms.forEach(mesocosm => {
      days.forEach(day => {
        const id = this.createDataId(variableId, mesocosm.id, day);
        mesocosmData.push(this.data[ id ]);
      });
    });
    return mesocosmData;
  }
}
