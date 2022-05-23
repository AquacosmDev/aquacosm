import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { map, ReplaySubject, takeUntil } from 'rxjs';
import { MesocosmDataService } from '../core/mesocosm-data.service';
import { TimePoint } from '../shared/models/mesocosm-data.model';

@Component({
  selector: 'aqc-chart-example',
  templateUrl: './chart-example.component.html',
  styleUrls: ['./chart-example.component.scss']
})
export class ChartExampleComponent implements OnInit, OnDestroy {
  public depthData!: [ { label: string, data: TimePoint[] }];
  public temperatureData!: [ { label: string, data: TimePoint[] }];
  public lightData!: [ { label: string, data: TimePoint[] }];
  public oxygenData!: [ { label: string, data: TimePoint[] }];
  // public depthData = [
  //   {label: 'Limnotron 1', data: [ 1065.6, 1065.4, 1066, 1065.6, 1065.7, 1065.5, 1065.8 ] },
  //   {label: 'Limnotron 2', data: [ 1055.6, 1054.4, 1054, 1054.6, 1055.7, 1054.5, 1057.8 ] },
  //   {label: 'Limnotron 3', data: [ 1000.6, 1000.4, 1000, 1000.6, 1000.7, 1000.5, 1000.8 ] },
  //   {label: 'Limnotron 4', data: [ 1055.6, 1074.4, 1044, 1044.6, 1045.7, 1044.5, 1047.8 ] },
  //   {label: 'Limnotron 5', data: [ 1065.6, 1055.4, 1046, 1035.6, 1025.7, 1015.5, 1005.8 ] },
  //   {label: 'Limnotron 6', data: [ 1035.6, 1034.4, 1034, 1034.6, 1035.7, 1034.5, 1037.8 ] },
  // ];
  // public temperatureData = [ {label: 'Limnotron 1', data: [ 12.4, 12.4, 12.3, 12.3, 12.3, 12.3, 12.3 ] }];
  // public lightData = [ {label: 'Limnotron 1', data: [ 11.02, 11.02, 11.02, 11.02, 11.02, 11.02, 11.02 ] }];
  // public oxygenData = [ {label: 'Limnotron 1', data: [ 4.4, 4.4, 4.4, 4.4, 4.4, 4.4, 4.4 ] }];

  public isMobile = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private detectorService: DeviceDetectorService, private mesocosmDataService: MesocosmDataService) { }

  ngOnInit(): void {
    this.isMobile = this.detectorService.isMobile();
    this.getMesocosmDataDepth();
    this.getMesocosmDataTemperature();
    this.getMesocosmDataLight();
    this.getMesocosmDataOxygen();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getMesocosmDataDepth() {
    this.mesocosmDataService.get('wsgxgvsL5pFtxbfyQuwA')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(depthData => this.depthData = [{
        label: 'Limnotron 1',
        data: depthData.data
      }])
  }

  private getMesocosmDataTemperature() {
    this.mesocosmDataService.get('1dlqFd9hlcsRpDznRuiM')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(temperatureData => this.temperatureData = [{
        label: 'Limnotron 1',
        data: temperatureData.data
      }])
  }

  private getMesocosmDataLight() {
    this.mesocosmDataService.get('jO3HFSIsPMlCKXUYeMmB')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(lightData => this.lightData = [{
        label: 'Limnotron 1',
        data: lightData.data
      }])
  }

  private getMesocosmDataOxygen() {
    this.mesocosmDataService.get('gVpBf0kNqSHCH7wlmhqj')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(oxygenData => this.oxygenData = [{
        label: 'Limnotron 1',
        data: oxygenData.data
      }])
  }

}
