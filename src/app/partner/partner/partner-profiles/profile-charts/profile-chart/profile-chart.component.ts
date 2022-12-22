import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ProfileChartData } from '@shr/models/profile-chart-data.model';
import 'chartjs-adapter-moment';
import { DecodeHtmlStringPipe } from '@shr/pipes/decode-html-string.pipe';

@Component({
  selector: 'aqc-profile-chart',
  templateUrl: './profile-chart.component.html',
  styleUrls: ['./profile-chart.component.scss']
})
export class ProfileChartComponent implements OnInit, OnChanges {
  @Input() chartData!: ProfileChartData;

  public lineChartData!: ChartConfiguration['data'];
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
        radius: 1
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
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          drawTicks: false
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0
        },
      },
      y: {
      }
    }
  };
  public lineChartType: ChartType = 'line';

  private chartColors = [ '#000000', '#e69f00', '#56b5e9', '#029f73', '#f0e341', '#0072b2', '#d55e00', '#cc79a7', '#332388' ]

  constructor(private decodeHtmlStringPipe: DecodeHtmlStringPipe) { }

  ngOnInit(): void {
    this.setLineChartData();
    this.setLineChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['dataSets'] && !!changes['dataSets'].previousValue && !!changes['dataSets'].currentValue) {
      if(this.chartData.datasets.length > 0) {
        this.setLineChartData();
        this.setLineChartOptions();
      } else {
        this.lineChartData.datasets = [];
      }
    }
  }

  private setLineChartData() {
    this.lineChartData = {
      datasets: this.chartData.datasets.map((dataSet, index) => {
        return {
          data: dataSet.data,
          label: dataSet.label,
          borderColor: this.chartColors[ index ],
          backgroundColor: this.chartColors[ index ],
          showLine: true
        }
      }),
      labels: this.chartData.times
    };
  }

  private setLineChartOptions() {
    let mergedDataSets: number[] = [];
    this.lineChartData.datasets.forEach(dataSet => mergedDataSets = mergedDataSets.concat(dataSet.data as number[]))
    const dataSortedOnValue = mergedDataSets
      .filter(point => point !== null)
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
          text: `${this.chartData.variable.name} (${this.decodeHtmlStringPipe.transform(this.chartData.variable.unit)})`
        },
        min: Math.floor(dataRange.min - twentyPercent),
        max: Math.ceil(dataRange.max + twentyPercent)
      }
    } else {
      this.lineChartOptions.scales['y']! = {
        title: {
          display: true,
          text: 'AXIS'
        }
      }
    }
    this.lineChartOptions = { ...this.lineChartOptions };
  }

}
