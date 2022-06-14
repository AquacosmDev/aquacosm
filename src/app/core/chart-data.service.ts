import { Injectable } from '@angular/core';
import { ChartData } from '@shr//models/chart-data.model';
import { MesocosmDataService } from '@core/collections/mesocosm-data.service';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { MesocosmData } from '@shr//models/mesocosm-data.model';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { Mesocosm } from '@shr//models/mesocosm.model';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  constructor(private mesocosmDataService: MesocosmDataService) { }

  public getChartDataForVariable(variableId: string, mesocosms: Mesocosm[]): Observable<ChartData[]> {
    return combineLatest(mesocosms.map(mesocosm => this.mesocosmDataService.getMesocosmDataByVariableAndMesocosm(variableId, mesocosm.id!)))
      .pipe(map(mesocosmData => this.mesocosmDataToChartData(mesocosms, mesocosmData)))
  }

  private mesocosmDataToChartData(mesocosms: Mesocosm[], mesocosmData: MesocosmData[]): ChartData[] {
    return mesocosms.map(mesocosm => this.mesocosmToChartData(mesocosm,
          mesocosmData.find(singleMesocosmData => singleMesocosmData.mesocosmId === mesocosm.id)!));
  }

  private mesocosmToChartData(mesocosm: Mesocosm, mesocosmData: MesocosmData): ChartData {
    return {
      label: mesocosm.name,
      data: mesocosmData.data
    }
  }
}
