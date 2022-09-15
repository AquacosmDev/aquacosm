import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from '@core/loading.service';

@Component({
  selector: 'aqc-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() variableIds!: string[];

  public percentage!: string;

  constructor(private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.getLoadingInformation();
  }

  private getLoadingInformation() {
    const observable = this.variableIds.length === 1 ?
      this.loadingService.getLoadingStatus(this.variableIds[ 0 ]) :
      this.loadingService.getLoadingStatusForMultipleVariables(this.variableIds);

    observable.subscribe(percentage => this.percentage = percentage.toFixed(0));
  }

}
