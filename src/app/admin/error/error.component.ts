import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorService } from '@core/collections/error.service';
import { Error } from '@shr//models/error.model';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'aqc-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit, OnDestroy {

  public errors!: Error[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private errorService: ErrorService) { }

  ngOnInit(): void {
    this.getErrors();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getErrors() {
    this.errorService.getErrors()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(errors => this.errors = errors);
  }

}
