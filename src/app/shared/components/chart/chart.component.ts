import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'aqc-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() dataSets!: { label: string, data: number[] }[];
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

  constructor() { }

  ngOnInit(): void {
    this.lineChartData = {
      datasets: this.dataSets.map(dataSet => {
        return {
          data: dataSet.data,
          label: dataSet.label
        }
      }),
      labels: [ ['15:54', '14 april'], '15:55', '15:56', '15:57', '15:58', '15:59', '16:00' ]
    };
  }

}
