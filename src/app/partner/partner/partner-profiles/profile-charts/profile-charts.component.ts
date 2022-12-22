import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Profile } from '@shr/models/profile.model';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ProfileChartService } from '@ptn/partner/partner-profiles/profile-chart.service';
import { ProfileChartData } from '@shr/models/profile-chart-data.model';

@Component({
  selector: 'aqc-profile-charts',
  templateUrl: './profile-charts.component.html',
  styleUrls: ['./profile-charts.component.scss'],
  providers: [ ProfileChartService ]
})
export class ProfileChartsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() profile!: Profile;

  public chartData: ProfileChartData[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private profileChartService: ProfileChartService) { }

  ngOnInit(): void {
    this.getChartData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['profile'] && !!changes['profile'].previousValue && !!changes['profile'].currentValue) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
      this.destroyed$ = new ReplaySubject(1);
      if(this.profile) {
        this.getChartData();
      } else {
        this.chartData = [];
      }
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getChartData() {
    this.profileChartService.getChartDataForProfile(this.profile)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(chartData => this.chartData = chartData);
  }
}
