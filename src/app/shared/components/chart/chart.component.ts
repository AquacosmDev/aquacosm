import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { TimePoint } from '../../models/mesocosm-data.model';
import { DateService } from '../../../core/date.service';
import { ChartData } from '@shr//models/chart-data.model';

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
          text: 'Time'
        }
      },
      y: {
      }
    }
  };

  public lineChartType: ChartType = 'line';

  constructor(private dateService: DateService) { }

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
        .map(timepoint => this.dateService.format(timepoint.time))
    };
  }

  private setLineChartOptions() {
    this.lineChartOptions!.scales!['y']! = {
      title: {
        display: true,
        text: this.yAxisTitle
      }
    }
  }

}
