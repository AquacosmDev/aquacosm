import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, ReplaySubject, take, takeUntil, tap } from 'rxjs';
import { IsSelectedService } from '@core/is-selected.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService implements OnDestroy {

  private $loading = new BehaviorSubject<boolean>(true);

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private requestNumbers: { [ variableId: string ]: BehaviorSubject<number> } = {};
  private totalRequests: { [ variableId: string ]: number } = {};

  constructor(private isSelectedService: IsSelectedService) {
    this.triggerLoading();
  }

  ngOnDestroy() {
    this.$loading.complete();
    this.$loading = null;
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public triggerLoading() {
    this.isSelectedService.getMesocosmsAndDays()
      .pipe(
        takeUntil(this.destroyed$),
        filter(object => object.mesocosmIds.length > 0))
      .subscribe(() => this.$loading.next(true))
  }

  public startLoading(): Observable<boolean> {
    return this.$loading.asObservable();
  }

  public getLoadingStatus(variableId: string): Observable<number> {
    if(!this.requestNumbers[ variableId ]) {
      this.requestNumbers[ variableId ] = new BehaviorSubject<number>(0);
    } else {
      this.requestNumbers[ variableId ].next(0);
    }

    this.clearCounter(variableId);

    return this.requestNumbers[ variableId ].asObservable()
      .pipe(map(numberOfReq => this.getPercentageDone(variableId, numberOfReq)));
  }



  public getLoadingStatusForMultipleVariables(variableIds: string[]): Observable<number> {
    variableIds.forEach(variableId => {
      if(!this.requestNumbers[ variableId ]) {
        this.requestNumbers[ variableId ] = new BehaviorSubject<number>(0);
      }
      this.clearCounter(variableId);
    });

    return combineLatest(variableIds.map(variableId => this.getPercentageDoneForVariable(variableId)))
      .pipe(map(percentagePerRequest => percentagePerRequest.reduce((pV, cV, index) => pV + cV, 0) / percentagePerRequest.length));
  }

  public setNumberOfRequests(variableId: string, requests: number) {
    this.totalRequests[ variableId ] = requests;
  }

  public setNewPercentage(variableId: string, requestNumber: number) {
    if(!this.requestNumbers[ variableId ]) {
      this.requestNumbers[ variableId ] = new BehaviorSubject<number>(0);
    }
    this.requestNumbers[ variableId ].next(requestNumber);
  }

  private getPercentageDone(variableId: string, reqNumber: number): number {
    return !!this.totalRequests[ variableId ] ? reqNumber / this.totalRequests[ variableId ] * 90 : 0;
  }

  private clearCounter(variableId: string) {
    this.requestNumbers[ variableId ].asObservable()
      .pipe(
        map(numberOfReq => this.getPercentageDone(variableId, numberOfReq)),
        filter(percentage => percentage  === 90), take(1))
      .subscribe(() => {
        this.requestNumbers[ variableId ].complete();
        this.requestNumbers[ variableId ] = null;
      })
  }

  private getPercentageDoneForVariable(variableId: string): Observable<number> {
    return this.requestNumbers[ variableId ].asObservable()
      .pipe(map(numberOfReq => this.getPercentageDone(variableId, numberOfReq)));
  }
}
