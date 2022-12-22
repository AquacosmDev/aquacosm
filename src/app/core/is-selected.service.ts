import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, tap } from 'rxjs';
import { DateRange } from '@shr/models/date-range.model';
import { DateService } from '@core/date.service';
import { DataType } from '@shr/models/data-type.enum';

@Injectable({
  providedIn: 'root'
})
export class IsSelectedService implements OnDestroy {
  private mesocosms = new BehaviorSubject<string[]>([]);
  private variables = new BehaviorSubject<string[]>([]);
  private dateRange = new BehaviorSubject<DateRange>({} as DateRange);
  private dataType = new BehaviorSubject<DataType>(DataType.averaged);

  constructor(private dateService: DateService) {
    this.setIsSelectedFromLocalStore();
  }

  ngOnDestroy() {
    this.mesocosms.complete();
    this.mesocosms = null;
    this.variables.complete();
    this.variables = null;
    this.dateRange.complete();
    this.dateRange = null;
    this.dataType.complete();
    this.dataType = null;
  }

  public setMesocosms(mesocosmIds: string[], isInit = false) {
    localStorage.setItem('mesocosms',JSON.stringify(mesocosmIds));
    if(this.mesocosms.getValue().length === 0 || !isInit) {
      this.mesocosms.next(mesocosmIds);
    }
  }

  public getMesocosms(): Observable<string[]> {
    return this.mesocosms.asObservable();
  }

  public setVariables(variableIds: string[], isInit = false) {
    localStorage.setItem('variables',JSON.stringify(variableIds));
    if(!isInit) {
      this.variables.next(variableIds);
    }
  }

  public getVariables(): Observable<string[]> {
    return this.variables.asObservable();
  }

  public setDateRange(dateRange: DateRange) {
    if (!this.dateService.isDateRangeSame(dateRange, this.dateRange.getValue())) {
      localStorage.setItem('dateRange', JSON.stringify(dateRange));
      this.dateRange.next(dateRange);
    }
  }

  public getDataType(): Observable<DataType> {
    return this.dataType.asObservable();
  }

  public setDataType(dataType: DataType) {
    localStorage.setItem('dataType', dataType);
    this.dataType.next(dataType);
  }

  public getDateRange(): Observable<DateRange> {
    return this.dateRange.asObservable().pipe(filter(dateRange => !!dateRange.end));
  }

  public getMesocosmsAndDays():Observable<{ mesocosmIds: string[], days: number[] }> {
    return combineLatest([this.getMesocosms(), this.getDays()])
      .pipe(map(([ mesocosmsIds, days ]) => { return { mesocosmIds: mesocosmsIds, days: days }}))
  }

  public getMesocosmsAndVariables():Observable<{ mesocosms: string[], variables: string[] }> {
    return combineLatest([this.getMesocosms(), this.getVariables()])
      .pipe(map(([ mesocosmsIds, variables ]) => { return { mesocosms: mesocosmsIds, variables: variables }}))
  }

  public getDays(): Observable<number[]> {
    return this.getDateRange()
      .pipe(map(dateRange => this.dateService.getDayArrayFromDateRange(dateRange)))
  }

  private setIsSelectedFromLocalStore() {
    const mesocosms = JSON.parse(localStorage.getItem('mesocosms'));
    if (!!mesocosms) {
      this.mesocosms.next(mesocosms);
    }

    const variables = JSON.parse(localStorage.getItem('variables'));
    if (!!variables) {
      this.variables.next(variables)
    }

    const stringDateRange = JSON.parse(localStorage.getItem('dateRange'));
    if(!!stringDateRange) {
      const dateRange: DateRange = {
        start: this.dateService.stringToDate(stringDateRange.start),
        end: this.dateService.stringToDate(stringDateRange.end)
      }
      this.setDateRange(dateRange);
    } else {
      this.dateService.createHourDateRange()
        .subscribe(dateRange => this.setDateRange(dateRange))
    }

    const dataType = localStorage.getItem('dataType');
    if (!!dataType) {
      this.dataType.next(dataType as DataType);
    }
  }
}
