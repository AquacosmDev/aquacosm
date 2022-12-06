import { Injectable } from '@angular/core';
import { CollectionService } from '@core/collections/collection.service';
import { MesocosmData, TimePoint } from '@shr/models/mesocosm-data.model';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { DateService } from '@core/date.service';
import { LoadingService } from '@core/loading.service';
import { IsSelectedService } from '@core/is-selected.service';
import { forkJoin, map, Observable, switchMap, take, tap } from 'rxjs';
import { DateRange } from '@shr/models/date-range.model';
import { ChartData } from '@shr/models/chart-data.model';

@Injectable({
  providedIn: 'root'
})
export class MesocosmYearDataService extends CollectionService<MesocosmData> {

  constructor(db: AngularFirestore, private dateService: DateService,
              private loadingService: LoadingService, private isSelectedService: IsSelectedService) {
    super(db);
    this.path = 'mesocosmYearData';
    this.setCollection(db.collection<MesocosmData>('mesocosmYearData'));
  }

  public getMesocosmsYearData(variableId: string, mesocosmIds: string[], years: number[]): Observable<MesocosmData[]> {
    return forkJoin(mesocosmIds.map(mesocosmId => this.getMesocosmYearData(variableId, mesocosmId, years).pipe(take(1)))).pipe(map(data => {
      return data.reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
    }));
  }

  public getMesocosmYearData(variableId: string, mesocosmId: string, years: number[]): Observable<MesocosmData[]> {
    return this.db.collection<MesocosmData>('mesocosmYearData', ref => ref
        .where('variableId', '==', variableId)
        .where('mesocosmId', '==', mesocosmId)
        .where('year', 'in', years))
      .get()
      .pipe(
        take(1),
        map(query => query.docs.map(doc => this.convertDocToItem(doc as unknown as DocumentSnapshot<MesocosmData>))),
        switchMap(mesocosmData => this.filterTimePointsOfData(mesocosmData)),
        switchMap(mesocosmData => this.completeYearData(mesocosmData)));
  }

  override convertItem(item:any): MesocosmData {
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }

  private filterTimePointsOfData(mesocosmData: MesocosmData[]): Observable<MesocosmData[]> {
    return this.isSelectedService.getDateRange()
      .pipe(
        take(1),
        map(dateRange => this.filterTimePointsForMesocosmData(mesocosmData, dateRange)));
  }

  private filterTimePointsForMesocosmData(mesocosmData: MesocosmData[], dateRange: DateRange): MesocosmData[] {
    mesocosmData.forEach(data => {
      data.data = data.data.filter(point => this.dateService.isInRange(point.time, dateRange));
    });
    return mesocosmData;
  }



  private completeYearData(mesocosmData: MesocosmData[]): Observable<MesocosmData[]> {
    return this.isSelectedService.getDays()
      .pipe(
        map(days => this.dateService.daysToDates(days)),
        map(days => mesocosmData.map(data => this.completeYearDataPerChartData(data, days))));
  }

  private completeYearDataPerChartData(mesocosmData: MesocosmData, days: Date[]): MesocosmData {
    days.forEach(day => {
      if(mesocosmData.data.findIndex(timepoint => this.dateService.isSame(timepoint.time, day, 'day')) === -1 &&
      mesocosmData.year === day.getFullYear()) {
        mesocosmData.data.push({
          time: day,
          value: null,
          standardDeviation: null,
          rollingAverage: null
        });
      }
    });

    return mesocosmData;
  }
}
