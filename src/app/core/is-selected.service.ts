import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, ReplaySubject, takeUntil, tap } from 'rxjs';
import { DateRange } from '@shr/models/date-range.model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { DateService } from '@core/date.service';
import { Variable } from '@shr/models/variable.model';

@Injectable({
  providedIn: 'root'
})
export class IsSelectedService implements OnDestroy {
  private mesocosms = new BehaviorSubject<string[]>([]);
  private variables = new BehaviorSubject<string[]>([]);
  private dateRange = new BehaviorSubject<DateRange>({} as DateRange);

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
  }

  public setMesocosms(mesocosms: Mesocosm[], isInit = false) {
    const mesocosmIds = mesocosms.map(mesocosm => mesocosm.id);
    localStorage.setItem('mesocosms',JSON.stringify(mesocosmIds));
    if(!isInit) {
      this.mesocosms.next(mesocosmIds);
    }
  }

  public getMesocosms(): Observable<string[]> {
    return this.mesocosms.asObservable();
  }

  public setVariables(variables: Variable[], isInit = false) {
    const variableIds = variables.map(variable => variable.id);
    localStorage.setItem('variables',JSON.stringify(variableIds));
    if(!isInit) {
      this.variables.next(variableIds);
    }
  }

  public getVariables(): Observable<string[]> {
    return this.variables.asObservable();
  }

  public setDateRange(dateRange: DateRange) {
    localStorage.setItem('dateRange',JSON.stringify(dateRange));
    this.dateRange.next(dateRange);
  }

  public getDateRange(): Observable<DateRange> {
    return this.dateRange.asObservable();
  }

  public getMesocosmsAndDays():Observable<{ mesocosmIds: string[], days: number[] }> {
    return combineLatest([this.getMesocosms(), this.getDays()])
      .pipe(map(([ mesocosmsIds, days ]) => { return { mesocosmIds: mesocosmsIds, days: days }}))
  }

  private getDays(): Observable<number[]> {
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
    const dateRange = JSON.parse(localStorage.getItem('dateRange'));
    this.setDateRange(!!dateRange ? dateRange : this.dateService.createHourDateRange());
  }
}
