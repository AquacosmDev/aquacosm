import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { TimePoint } from '../../models/mesocosm-data.model';
import { DateService } from '../../../core/date.service';

@Component({
  selector: 'aqc-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() dataSets!: { label: string, data: TimePoint[] }[];
  @Input() lineColor!: string;

  public lineChartData!: ChartConfiguration['data'];

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
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

}
