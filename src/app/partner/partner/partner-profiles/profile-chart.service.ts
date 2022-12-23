import { Injectable } from '@angular/core';
import { VariableService } from '@core/collections/variable.service';
import { Profile, ProfileData } from '@shr/models/profile.model';
import { forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { ProfileChartData, ProfileDataSet } from '@shr/models/profile-chart-data.model';
import { IsSelectedService } from '@core/is-selected.service';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { Variable } from '@shr/models/variable.model';
import { MesocosmService } from '@core/collections/mesocosm.service';

@Injectable()
export class ProfileChartService {

  constructor(private variableService: VariableService, private isSelectedService: IsSelectedService,
              private mesocosmService: MesocosmService) { }

  public getChartDataForProfile(profile: Profile): Observable<ProfileChartData[]> {
    return this.getMesocosmsAndVariables()
      .pipe(
        map(ids => this.variableToChartData(ids, profile)));
  }

  public getProfileChartDataForAllOptions(profiles: Profile[]): Observable<ProfileChartData[]> {
    return this.getMesocosmsAndVariablesForPartner(profiles[ 0 ].partnerId)
      .pipe(
        map(([mesocosms, variables]) => ({ mesocosms, variables })),
        map(ids => this.profilesToChartData(ids, profiles)));
  }

  private getMesocosmsAndVariablesForPartner(partnerId: string): Observable<[ Mesocosm[], Variable[]]> {
    return forkJoin([
      this.mesocosmService.getMesocosmByPartnerId(partnerId).pipe(take(1)),
      this.variableService.getVariableByPartnerId(partnerId).pipe(take(1))])
  }

  private getMesocosmsAndVariables(): Observable<{ mesocosms: Mesocosm[], variables: Variable[]}> {
    return this.isSelectedService.getMesocosmsAndVariables()
      .pipe(
        switchMap(ids => this.getMesocosms(ids)),
        switchMap(ids => this.getVariables(ids)))
  }

  private getMesocosms(ids: { mesocosms: string[], variables: string[]}): Observable<{ mesocosms: Mesocosm[], variables: string[]}> {
    const getMesocosms = ids.mesocosms.length > 0 ? this.mesocosmService.getByIds(ids.mesocosms) : of([]);

    return getMesocosms
      .pipe(
        take(1),
        map(mesocosms => {
          return { mesocosms: mesocosms, variables: ids.variables };
        }));
  }

  private getVariables(ids: { mesocosms: Mesocosm[], variables: string[]}): Observable<{ mesocosms: Mesocosm[], variables: Variable[]}> {
    const getVariables = ids.variables.length > 0 ? this.variableService.getByIds(ids.variables) : of([]);

    return getVariables
      .pipe(
        take(1),
        map(variables => {
          return { mesocosms: ids.mesocosms, variables: variables };
        }))
  }

  private profilesToChartData(ids: { mesocosms: Mesocosm[], variables: Variable[]}, profile: Profile[]): ProfileChartData[] {
    let chartData: ProfileChartData[] = [];
    profile.forEach(profile => chartData = chartData.concat(this.variableToChartData(ids, profile)));
    return chartData;
  }

  private variableToChartData(ids: { mesocosms: Mesocosm[], variables: Variable[]}, profile: Profile): ProfileChartData[] {
    return ids.variables.map(variable => {
      return {
        variable: variable,
        times: profile.data.map(data => data.time),
        datasets: this.mesocosmsToDataSets(ids.mesocosms, variable.id, profile),
        startTime: profile.startTime
      }
    })
  }

  private mesocosmsToDataSets(mesocosms: Mesocosm[], variableId: string, profile: Profile): ProfileDataSet[] {
    return mesocosms.filter(mesocosm => !profile.mesocosms || profile.mesocosms.includes(mesocosm.id)).map(mesocosm => {
      return {
        label: mesocosm.name,
        data: profile.data.map(data => this.getDataFromProfileData(mesocosm.id, variableId, data))
      }
    })
  }

  private getDataFromProfileData(mesocosmId: string, variableId: string, data: ProfileData): number {
    return data[ Object.keys(data).find(key => key.includes(mesocosmId) && key.includes(variableId)) ] as number;
  }
}
