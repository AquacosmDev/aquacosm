import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartDataService } from '@core/chart-data.service';
import { ChartData } from '@shr//models/chart-data.model';
import { Mesocosm } from '@shr//models/mesocosm.model';
import { Variable } from '@shr//models/variable.model';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'aqc-variable-chart',
  templateUrl: './variable-chart.component.html',
  styleUrls: ['./variable-chart.component.scss']
})
export class VariableChartComponent implements OnInit, OnDestroy {

  @Input() variable!: Variable;
  @Input() mesocosms!: Mesocosm[];

  public yAxisNames: { [variableName: string]: string } = {
    'light': 'Light (PAR &#181;Mol m&#178; s&#185;)',
    'oxygen': 'Oxygen (mg/L)',
    'depth': 'Depth (mm)',
    'temperature': 'Temperature (&#176;C)'
  }
  public yAxisName!: string;

  public chartData!: ChartData[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private chartDataService: ChartDataService) { }

  ngOnInit(): void {
    this.getChartData();
    this.yAxisName = this.yAxisNames[ this.variable.name ];
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getChartData() {
    this.chartDataService.getChartData(this.variable.id!, this.mesocosms)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(chartData => this.chartData = chartData);
  }

}
