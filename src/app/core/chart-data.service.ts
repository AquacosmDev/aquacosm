import { Injectable } from '@angular/core';
import { ChartData } from '@shr//models/chart-data.model';
import { MesocosmDataService } from '@core/collections/mesocosm-data.service';
import { BehaviorSubject, combineLatest, filter, map, Observable, switchMap, take, tap } from 'rxjs';
import { MesocosmData } from '@shr//models/mesocosm-data.model';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { Mesocosm } from '@shr//models/mesocosm.model';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private charts$: { [variableId: string ]: BehaviorSubject<ChartData[]> } = {};

  constructor(private mesocosmDataService: MesocosmDataService, private mesocosmService: MesocosmService) { }

  public getChartData(variableId: string, mesocosms: Mesocosm[]): Observable<ChartData[]> {
    const observable = !!this.charts$[ variableId ] ?
      this.getVariableChart(variableId) : this.initChartData(variableId);

    return observable.pipe(
      filter(chartData => !!chartData && chartData.length > 0),
      map(chartData =>
        chartData.filter(data => mesocosms.map(mesocosm => mesocosm.id).includes(data.mesocosmId))));
  }

  public getChartDataForVariable(variableId: string): Observable<ChartData[]> {
    return this.mesocosmDataService.getMesocosmDataByVariable(variableId)
      .pipe(switchMap(mesocosmData => this.mesocosmDataToChartData(mesocosmData)))
  }

  private initChartData(variableId: string): Observable<ChartData[]> {
    this.charts$[ variableId ] = new BehaviorSubject<ChartData[]>([]);
    this.getChartDataForVariable(variableId)
      .subscribe(data => {
        this.charts$[ variableId ].next(data);
      })
    return this.getVariableChart(variableId);
  }

  private mesocosmDataToChartData(mesocosmData: MesocosmData[]): Observable<ChartData[]> {
    return this.getMesocosmsForMesocosmData(mesocosmData)
      .pipe(map(mesocosms => mesocosms.map(mesocosm => this.mesocosmToChartData(mesocosm,
        mesocosmData.find(singleMesocosmData => singleMesocosmData.mesocosmId === mesocosm.id)!))));
  }

  private getMesocosmsForMesocosmData(mesocosmData: MesocosmData[]): Observable<Mesocosm[]> {
    return combineLatest(mesocosmData.map(mesocosmDat => this.mesocosmService.get(mesocosmDat.mesocosmId)));
  }

  private mesocosmToChartData(mesocosm: Mesocosm, mesocosmData: MesocosmData): ChartData {
    return {
      label: mesocosm.name,
      data: mesocosmData.data,
      mesocosmId: mesocosm.id!
    }
  }

  private getVariableChart(variableId: string): Observable<ChartData[]> {
    return this.charts$[ variableId ].asObservable();
  }
}
