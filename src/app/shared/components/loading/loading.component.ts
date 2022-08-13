import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from '@core/loading.service';

@Component({
  selector: 'aqc-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() variableId!: string;

  public percentage!: string;

  constructor(private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.getLoadingInformation();
  }

  private getLoadingInformation() {
    this.loadingService.getLoadingStatus(this.variableId)
      .subscribe(percentage => this.percentage = percentage.toFixed(0));
  }

}
