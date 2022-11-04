import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataService } from '@core/chart-data.service';
import { ChartData } from '@shr//models/chart-data.model';
import { Variable } from '@shr//models/variable.model';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { VariableService } from '@core/collections/variable.service';
import { IsSelectedService } from '@core/is-selected.service';
import { DateRange } from '@shr/models/date-range.model';
import { LoadingService } from '@core/loading.service';

@Component({
  selector: 'aqc-variable-chart',
  templateUrl: './variable-chart.component.html',
  styleUrls: ['./variable-chart.component.scss']
})
export class VariableChartComponent implements OnInit, OnChanges, OnDestroy {

  @Input() variableId!: string;

  public variable!: Variable;
  public yAxisName!: string;

  public dateRange!: DateRange;

  public chartData!: ChartData[];

  public loading = true;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private variableService: VariableService, private chartDataService: ChartDataService,
              private loadingService: LoadingService, private isSelectedService: IsSelectedService) { }

  ngOnInit(): void {
    this.onChange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!changes['variableId'].firstChange) {
      this.onChange();
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private onChange() {
    this.startLoading();
    this.getVariable();
    this.getChartData();
    this.getDateRange();
  }

  private getChartData() {
    this.chartDataService.getChartData(this.variableId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(chartData => {
        console.log(chartData);
        this.chartData = chartData
        this.loading = false;
      });
  }

  private getDateRange() {
    this.isSelectedService.getDateRange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(dateRange => this.dateRange = dateRange)
  }

  private startLoading() {
    this.loadingService.startLoading()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.loading = true);
  }

  private getVariable() {
    this.variableService.get(this.variableId)
      .pipe(take(1))
      .subscribe(variable => {
        this.variable = variable;
        this.yAxisName = `${variable.name} (${variable.unit})`;
      });
  }
}
