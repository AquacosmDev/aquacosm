import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { MesocosmData, TimePoint } from '@shr//models/mesocosm-data.model';
import { BehaviorSubject, filter, forkJoin, map, Observable, switchMap, take, tap } from 'rxjs';
import { DateService } from '@core/date.service';
import { LoadingService } from '@core/loading.service';
import { CollectionService } from '@core/collections/collection.service';
import { IsSelectedService } from '@core/is-selected.service';
import { DateRange } from '@shr/models/date-range.model';

@Injectable({
  providedIn: 'root'
})
export class MesocosmDataService extends CollectionService<MesocosmData> {

  private alreadyRequesting$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private queue: number[] = [];
  private requestNumber: { [variableId: string ]: number } = {};

  constructor(db: AngularFirestore, private dateService: DateService,
              private loadingService: LoadingService, private isSelectedService: IsSelectedService) {
    super(db);
    this.path = 'mesocosmData';
    this.setCollection(db.collection<MesocosmData>('mesocosmData'));
  }

  public getMesocosmsData(variableId: string, mesocosmIds: string[], days: number[]): Observable<MesocosmData[]> {
    this.loadingService.setNumberOfRequests(variableId, mesocosmIds.length * (Math.ceil(days.length / 10)));
    return forkJoin(mesocosmIds.map(mesocosmId => this.getMesocosmsDataPerTen(variableId, mesocosmId, days).pipe(take(1))))
      .pipe(map(data => {
        return data.reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
      }),
        tap(() => this.requestNumber[ variableId ] = 0));
  }

  public getMesocosmDataForToday(variableId: string, mesocosmId: string): Observable<MesocosmData> {
    const day = this.dateService.dateToDay(new Date());
    return this.db.collection<MesocosmData>('mesocosmData', ref => ref
      .where('variableId', '==', variableId)
      .where('mesocosmId', '==', mesocosmId)
      .where('day', '==', day))
      .snapshotChanges()
      .pipe(
        filter(snapshot => !!snapshot[ 0 ] && snapshot[ 0 ].type === 'modified'),
        map(list => this.convertDocToItem(list[ 0 ].payload.doc as DocumentSnapshot<MesocosmData>)));
  }

  public getMesocosmsDataPerTen(variableId: string, mesocosmId: string, days: number[]): Observable<MesocosmData[]> {
    const daysInSetsOfTen = this.getDaysPerTen(days);
    return forkJoin(daysInSetsOfTen.map(setOfTenDays => this.getMesocosmData(variableId, mesocosmId, setOfTenDays).pipe(take(1))))
      .pipe(map(data => {
        return data.reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])
      }));
  }

  private getMesocosmData(variableId: string, mesocosmId: string, days: number[]): Observable<MesocosmData[]> {
    return this.isOpen()
      .pipe(
        switchMap(() => this.fromCache(this.db.collection<MesocosmData>('mesocosmData', ref => ref
          .where('variableId', '==', variableId)
          .where('mesocosmId', '==', mesocosmId)
          .where('day', 'in', days))).pipe(take(1))),
        tap(() => this.next(variableId)),
        map(query => query.docs.map(doc => this.convertDocToItem(doc as unknown as DocumentSnapshot<MesocosmData>))),
        map(mesocosmData => this.mapMesocosmDataToDay(days, mesocosmData, variableId, mesocosmId)),
        switchMap(mesecosmData => this.filterTimePointsOfData(mesecosmData)));

  }

  override convertItem(item:any): MesocosmData {
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }

  private getDaysPerTen(days: number[]): number[][] {
    const array = [];
    for (const day of days) {
      const index = days.findIndex(d => d === day);
      const arrayNumber = Math.floor(index / 10)
      if(!array[ arrayNumber ]) {
        array[ arrayNumber ] = [];
      }
      array[ arrayNumber ].push(day);
    }
    return array;
  }

  private filterTimePointsOfData(mesocosmData: MesocosmData[]): Observable<MesocosmData[]> {
    return this.isSelectedService.getDateRange()
      .pipe(
        take(1),
        map(dateRange => this.filterTimePointsForMesocosmData(mesocosmData, dateRange)));
  }

  private filterTimePointsForMesocosmData(mesocosmData: MesocosmData[], dateRange: DateRange): MesocosmData[] {
    mesocosmData.forEach(data => {
      data.data = this.filterTimePoints(data.data, dateRange);
    });
    return mesocosmData;
  }

  private filterTimePoints(data: TimePoint[], dateRange: DateRange): TimePoint[] {
    const differenceInMinutes = this.dateService.getDifferenceInMinutes(dateRange);
    let newData: TimePoint[] = [];
    if(differenceInMinutes < 180) {
      newData = data.filter(point => this.dateService.isInRange(point.time, dateRange));
    } else if (differenceInMinutes < 43200) {
      for (let index = 0; index < data.length; index= index + 60) {
        if (this.dateService.isInRange(data[ index ].time, dateRange)) {
          newData.push(data[index]);
        }
      }
    } else {
      for (let index = 0; index < data.length; index= index + 720) {
        if (this.dateService.isInRange(data[ index ].time, dateRange)) {
          newData.push(data[index]);
        }
      }
    }
    return newData;
  }

  private mapMesocosmDataToDay(days: number[], mesocosmData: MesocosmData[], variableId: string, mesocosmId: string): MesocosmData[] {
    return days.map(day => {
      const data = mesocosmData.find(data => data.day === day);
      return !!data ? data : this.createDummyData(day, variableId, mesocosmId);
    })
  }

  private createDummyData(day: number, variableId: string, mesocosmId: string): MesocosmData {
    const dates = this.dateService.getTimePointsForDay(day);
    return {
      variableId: variableId,
      mesocosmId: mesocosmId,
      day: day,
      data: dates.map(time => { return {
        time: time,
        value: null,
        rollingAverage: null,
        standardDeviation: null
      }})
    }
  }

  private isOpen(): Observable<number> {
    const index = this.queue.length > 0 ? this.queue[ this.queue.length - 1 ] + 1 : this.alreadyRequesting$.getValue() + 1;
    if (this.queue.length === 0) {
      this.alreadyRequesting$.next(index);
    }
    this.queue.push(index);
    return this.alreadyRequesting$.asObservable().pipe(
      filter(next => next === index),
      take(1));
  }

  private next(variableId: string) {
    this.sendNewPercentage(variableId)
    this.queue.shift();
    if(this.queue.length > 0) {
      this.alreadyRequesting$.next(this.queue[ 0 ]);
    }
  }

  private sendNewPercentage(variableId: string) {
    this.requestNumber[ variableId ] = !!this.requestNumber[ variableId ] ? ++this.requestNumber[ variableId ] : 1;
    this.loadingService.setNewPercentage(variableId, this.requestNumber[ variableId ]);
  }
}
