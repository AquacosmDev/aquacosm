import { Injectable } from '@angular/core';
import { Variable } from '@shr/models/variable.model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { DateRange } from '@shr/models/date-range.model';
import { DateService } from '@core/date.service';
import { BehaviorSubject, buffer, filter, forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { ChartDataService } from '@core/chart-data.service';
import { MesocosmData } from '@shr/models/mesocosm-data.model';
import { CsvData } from '@shr/models/csv-data.model';
import * as Papa from 'papaparse';

@Injectable()
export class DownloadDataService {

  private alreadyRequesting$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private queue: string[] = [];

  private variableNames: { [ id: string ]: string } = {};
  private mesocosmNames: { [ id: string ]: string } = {};

  constructor(private dateService: DateService, private chartDataService: ChartDataService) { }

  public downloadData(variables: Variable[], mesocosms: Mesocosm[], dateRange: DateRange): Observable<CsvData[]> {
    const days = this.dateService.getDayArrayFromDateRange(dateRange);
    variables.forEach(variable => this.variableNames[ variable.id ] = variable.name );
    mesocosms.forEach(mesocosm => this.mesocosmNames[ mesocosm.id ] = mesocosm.name );

    return forkJoin(variables.map(variable => this.downloadDataForVariable(variable.id, mesocosms, days).pipe(take(1))))
      .pipe(map(dataForVariable => dataForVariable.reduce((pV, cV) => cV.concat(pV), [])),
        )
  }

  private downloadDataForVariable(variableId: string, mesocosms: Mesocosm[], days: number[]): Observable<CsvData[]> {
    this.inQueue(variableId)
    return of(variableId)
      .pipe(
        buffer(this.isOpen(variableId)),
        switchMap(() => this.chartDataService.downloadData(variableId, mesocosms, days)),
        map(mesocosmData => mesocosmData.map(data => this.dataToCsvObject(data)).reduce((pV, cV) => cV.concat(pV), [])),
        tap(() => this.next()));
  }

  private dataToCsvObject(mesocosmData: MesocosmData): CsvData[] {
    return mesocosmData.data.map(timePoint => { return {
      variable: this.variableNames[ mesocosmData.variableId ],
      mesocosm: this.mesocosmNames[ mesocosmData.mesocosmId ],
      time: this.dateService.format(timePoint.time, 'yyyy-MM-DD HH:mm'),
      value: timePoint.value
    }})
  }

  public exportScoresAsCsv(csvData: CsvData[]) {
    const csv = Papa.unparse(csvData);

    const csvDataBlob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    let csvURL = window.URL.createObjectURL(csvDataBlob);

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `data.csv`);
    tempLink.click();
  }

  private inQueue(variableId: string) {
    this.queue.push(variableId);
    if (this.alreadyRequesting$.getValue() === '' && this.queue.length === 1) {
      this.alreadyRequesting$.next(this.queue.shift());
    }
  }

  private isOpen(variableId: string): Observable<string> {
    return this.alreadyRequesting$.asObservable().pipe(
      filter(next => {
        return next === variableId
      }));
  }

  private next() {
    this.alreadyRequesting$.next(this.queue.length > 0 ? this.queue.shift() : '');
  }
}
