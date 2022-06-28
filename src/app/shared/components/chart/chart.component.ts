import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartData } from '@shr//models/chart-data.model';
import { DateService } from '@core/date.service';
import { TimePoint } from '@shr/models/mesocosm-data.model';

@Component({
  selector: 'aqc-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() dataSets!: ChartData[];
  @Input() lineColor!: string;
  @Input() yAxisTitle!: string;

  public lineChartData!: ChartConfiguration['data'];

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
        radius: 0
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (h)'
        },
        ticks: {
          callback: function(val, index) {
            const everyThreeHours = [ 0, 3, 6, 9, 12, 15, 18, 21 ];
            const label = this.getLabelForValue(+val);
            let visibleLabel;
            let splitTime
            if (Array.isArray(label)) {
              splitTime = label[ 0 ].split(':');
              visibleLabel = [ splitTime[ 0 ], label[ 1 ]];
            } else {
              splitTime = label.split(':');
              visibleLabel = splitTime [ 0 ];
            }
            return val === 0 ? visibleLabel :
              splitTime[1] === '00' && everyThreeHours.includes(+splitTime[ 0 ]) ? visibleLabel : null;
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

  constructor(private dateService: DateService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setLineChartData();
    this.setLineChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['dataSets'].currentValue) {
      this.setLineChartData();
    }
  }

  private setLineChartData() {
    this.lineChartData = {
      datasets: this.dataSets.map(dataSet => {
        return {
          data: dataSet.data
            .sort((a, b) => a.time.getTime() - b.time.getTime())
            .map(timepoint => timepoint.value),
          label: dataSet.label
        }
      }),
      labels: this.dataSets[ 0 ].data
        .sort((a, b) => a.time.getTime() - b.time.getTime())
        .map((timepoint, index) => this.getChartLabel(timepoint, index))
    };
  }

  private getChartLabel(timepoint: TimePoint, index: number) {
    const correctTime = this.dateService.addHours(timepoint.time, -2);
    const timeInMinutes = this.dateService.format(correctTime);
    if (this.dateService.isNewDay(timepoint.time) || index === 0) {
      return [ timeInMinutes, this.dateService.format(timepoint.time, 'YYYY-MM-DD')]
    } else {
      return timeInMinutes
    }
  }

  private setLineChartOptions() {
    let mergedDataSets: TimePoint[] = [];
    this.dataSets.forEach(dataSet => mergedDataSets = mergedDataSets.concat(dataSet.data))
    const dataSortedOnValue = mergedDataSets
        .sort((a, b) => a.value - b.value)
        .map(timepoint => timepoint.value);

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
        min: dataRange.min - twentyPercent,
        max: dataRange.max + twentyPercent
      }
    } else {
      this.lineChartOptions!.scales!['y']! = {
        title: {
          display: true,
          text: this.yAxisTitle
        }
      }
    }
  }
}
