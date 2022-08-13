import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartData } from '@shr//models/chart-data.model';
import { DateService } from '@core/date.service';
import { TimePoint } from '@shr/models/mesocosm-data.model';
import { BaseChartDirective } from 'ng2-charts';
import { DateRange } from '@shr/models/date-range.model';
import { ChartDataService } from '@core/chart-data.service';
import { ReplaySubject, skip, takeUntil } from 'rxjs';

@Component({
  selector: 'aqc-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dataSets!: ChartData[];
  @Input() dateRange!: DateRange;
  @Input() lineColor!: string;
  @Input() yAxisTitle!: string;

  @ViewChild(BaseChartDirective) htmlChart: BaseChartDirective;

  public lineChartData!: ChartConfiguration['data'];
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
        radius: 0
      }
    },
    plugins: {
      legend: {
        labels: {
          filter: function(item, chart) {
            // Logic to remove a particular legend item goes here
            return !!item && !!item.text;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          callback: function (val) {
            // @ts-ignore
            const label = this.getLabelForValue(+val) as string[];
            let visibleLabel;
            let splitTime;
            if (label.length > 2) {
              splitTime = label[1].split(':');
              visibleLabel = [splitTime[0], label[2]];
            } else {
              splitTime = label[1].split(':');
              visibleLabel = splitTime [0];
            }

            if (label[0] === 'hour') {
              if (val === 0) {
                label.shift();
              }
              const everyTenMinutes = [0, 10, 20, 30, 40, 50];
              return val === 0 ? label :
                splitTime[1] === '00' ? splitTime[0] + ':' + splitTime[1] :
                  everyTenMinutes.includes(+splitTime[0]) ? visibleLabel : null;
            } else if (label[0] === 'day') {
              const show = [0, 3, 6, 9, 12, 15, 18, 21];
              return val === 0 ? visibleLabel :
                splitTime[1] === '00' && show.includes(+splitTime[0]) ? visibleLabel : null;
            } else if (label[0] === 'week') {
              const show = [0, 12];
              return label.length === 3 ? [label[2]] :
                splitTime[1] === '00' && show.includes(+splitTime[0]) ? '' : null;
            } else if (label[0] === 'month') {
              const show = [0];
              splitTime = label[1].split(':');
              return label.length === 4 ? ['' + +label[2], label[3]] :
                splitTime[1] === '00' && show.includes(+splitTime[0]) && +label[2] % 2 === 0 ? +label[2] : null;
            } else {
              return label;
            }
          },
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0
        },
        grid: {
          drawTicks: false
        }
      },
      y: {
      }
    }
  };
  public lineChartType: ChartType = 'line';

  private timeDifference!: number;
  private times!: Date[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private dateService: DateService, private chartDataService: ChartDataService) { }

  ngOnInit(): void {
    this.timeDifference = this.dateService.getDifferenceInMinutes(this.dateRange);
    this.setLineChartData();
    this.setLineChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['dataSets'] && !!changes['dataSets'].previousValue && !!changes['dataSets'].currentValue) {
      this.setLineChartData();
      this.setLineChartOptions();
    }
    if (!!changes['dateRange'] && !!changes['dateRange'].previousValue && !!changes['dateRange'].currentValue) {
      this.timeDifference = this.dateService.getDifferenceInMinutes(this.dateRange);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private setLineChartData() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.times = this.dateService.getTimePointsForDateRange(this.dateRange);
    if (this.dataSets.length === 1) {
      this.lineChartData = {
        datasets: [
          {
            data: this.dataSets[ 0 ].data
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map(timepoint => {
                const value = this.timeDifference < 180 ? timepoint.value : timepoint.rollingAverage;
                return !!value ? value - timepoint.standardDeviation : null;
              })
              .slice(0, this.times.length),
            backgroundColor: 'rgba(201, 203, 207, 0.5)',
            fill: +2,
            borderColor: 'rgba(255, 255, 255, 0)'
          },
          {
            data: this.dataSets[ 0 ].data
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map(timepoint => this.timeDifference < 180 ? timepoint.value : timepoint.value)
              .slice(0, this.times.length),
            label: this.dataSets[ 0 ].label
          },
          {
            data: this.dataSets[ 0 ].data
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map(timepoint => {
                const value = this.timeDifference < 180 ? timepoint.value : timepoint.rollingAverage;
                return !!value ? value + timepoint.standardDeviation : null;
              })
              .slice(0, this.times.length),
            borderColor: 'rgba(255, 255, 255, 0)'
          },
        ],
        labels: this.getChartLabels()
      };
    } else if (this.dataSets[ 0 ].data && this.dataSets[ 0 ].data.length > 0) {
      this.lineChartData = {
        datasets: this.dataSets.map(dataSet => {
          return {
            data: dataSet.data
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map(timepoint => timepoint.rollingAverage)
              .slice(0, this.times.length),
            label: dataSet.label
          }
        }),
        labels: this.getChartLabels()
      };
    }

    if(this.timeDifference < 180) {
      this.destroyed$ = new ReplaySubject(1);
      this.dataSets.forEach((dataSet, index) => {
        this.chartDataService.getLatestData(dataSet.variableId, dataSet.mesocosmId)
          .pipe(takeUntil(this.destroyed$), skip(1))
          .subscribe(timePoints => {
            timePoints.forEach(point => {
              if (this.dataSets.length === 1) {
                this.lineChartData.datasets[ 0 ].data.shift();
                this.lineChartData.datasets[ 1 ].data.shift();
                this.lineChartData.datasets[ 2 ].data.shift();
                this.lineChartData.labels.shift();
                this.times.shift();
                const value = this.timeDifference < 180 ? point.value : point.rollingAverage;
                this.lineChartData.datasets[ 0 ].data.push(!!value ? value - point.standardDeviation : null);
                this.lineChartData.datasets[ 1 ].data.push(value);
                this.lineChartData.datasets[ 2 ].data.push(!!value ? value + point.standardDeviation : null);
                this.lineChartData.labels[ 0 ] = this.getChartLabel(this.times[ 0 ], 0);
                this.lineChartData.labels.push(this.getChartLabelForHour(point.time, 1));
                this.times.push(point.time);
              } else {
                this.lineChartData.datasets[index].data.shift();
                const value = this.timeDifference < 180 ? point.value : point.rollingAverage;
                this.lineChartData.datasets[index].data.push(value);
                if(index === 0) {
                  this.times.shift();
                  this.lineChartData.labels.shift();
                  this.lineChartData.labels[ 0 ] = this.getChartLabel(this.times[ 0 ], 0);
                  this.lineChartData.labels.push(this.getChartLabelForHour(point.time, 1));
                  this.times.push(point.time);
                }
              }
            });
            this.lineChartData = { ...this.lineChartData };
            this.setLineChartOptions();
          },
            error => {},
            () => console.log('complete ' + index ))
      })
    }
  }

  private getChartLabels(): Array<string | string[]> {
    const chartLabels = [];
    let index = 0;
    for(let time of this.times) {
      chartLabels.push(this.getChartLabel(time, index));
      index++;
    }
    return chartLabels;
  }

  public getChartLabel(correctStartTime: Date, index: number): string [] {
    let label;
    if(this.timeDifference < 180) {
      label = this.getChartLabelForHour(correctStartTime, index);
    } else if (this.timeDifference < 4320) {
      label = this.getChartLabelsForDay(correctStartTime, index);
    } else if (this.timeDifference < 11520) {
      label = this.getChartLabelsForWeek(correctStartTime, index);
    } else {
      label =this.getChartLabelsForMonth(correctStartTime, index);
    }
    return label
  }

  private getChartLabelForHour(correctStartTime: Date, index: number): string[] {
    const timeInMinutes = this.dateService.format(correctStartTime, 'mm');
    if (index === 0)
      return [ 'hour', this.dateService.format(correctStartTime, 'HH:mm'),
        this.dateService.format(correctStartTime, 'MM-DD')];
    if (this.dateService.isNewDay(correctStartTime)) {
      return [ 'hour',this.dateService.format(correctStartTime, 'HH:mm'),
        this.dateService.format(correctStartTime, 'MM-DD')];
    } else if (this.dateService.isNewHour(correctStartTime)) {
      return [ 'hour', this.dateService.format(correctStartTime, 'HH:mm')];
    } else {
      return [ 'hour', timeInMinutes ];
    }
  }

  private getChartLabelsForDay(correctStartTime: Date, index: number): string[] {
    const timeInMinutes = this.dateService.format(correctStartTime);
    if (this.dateService.isNewDay(correctStartTime) || index === 0) {
      return [ 'day', timeInMinutes, this.dateService.format(correctStartTime, 'MM-DD')];
    } else {
      return [ 'day', timeInMinutes ];
    }
  }

  private getChartLabelsForWeek(correctStartTime: Date, index: number): string[] {
    const timeInMinutes = this.dateService.format(correctStartTime);
    if (this.dateService.isNewDay(correctStartTime) || index === 0) {
      return [ 'week', timeInMinutes, this.dateService.format(correctStartTime, 'MM-DD')];
    } else {
      return [ 'week', timeInMinutes ];
    }
  }

  private getChartLabelsForMonth(correctStartTime: Date, index: number): string[] {
    const timeInMinutes = this.dateService.format(correctStartTime);
    if (this.dateService.isNewMonth(correctStartTime) || index === 0) {
      return [ 'month', timeInMinutes, this.dateService.format(correctStartTime, 'DD'), this.dateService.format(correctStartTime, 'MMM')];
    } else if (this.dateService.isNewDay(correctStartTime)) {
      return [ 'month', timeInMinutes, this.dateService.format(correctStartTime, 'DD')];
    } else {
      return [ 'month', timeInMinutes ];
    }
  }

  private setLineChartOptions() {
    let mergedDataSets: number[] = [];
    this.lineChartData.datasets.forEach(dataSet => mergedDataSets = mergedDataSets.concat(dataSet.data as number[]))
    const dataSortedOnValue = mergedDataSets
      .filter(point => !!point)
      .sort((a, b) => a - b);

    const dataRange = {
      min: dataSortedOnValue[0],
      max: dataSortedOnValue[dataSortedOnValue.length - 1]
    }

    const twentyPercent = ((dataRange.max - dataRange.min) / 100) * 20;

    if (twentyPercent !== 0) {
      this.lineChartOptions!.scales!['y']! = {
        title: {
          display: true,
          text: this.yAxisTitle
        },
        min: Math.floor(dataRange.min - twentyPercent) > 0 ? Math.floor(dataRange.min - twentyPercent) : 0,
        max: Math.ceil(dataRange.max + twentyPercent)
      }
    } else {
      this.lineChartOptions.scales['y']! = {
        title: {
          display: true,
          text: this.yAxisTitle
        }
      }
    }
    this.lineChartOptions = { ...this.lineChartOptions };
  }
}
