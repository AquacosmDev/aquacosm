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
import { MetaDataService } from '@core/collections/meta-data.service';
import { MetaData } from '@shr/models/meta-data.model';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { CsvMetaData } from '@shr/models/csv-meta-data.model';
import { Partner } from '@shr/models/partner-model';
import { DecodeHtmlStringPipe } from '@shr/pipes/decode-html-string.pipe';

@Injectable()
export class DownloadDataService {

  private alreadyRequesting$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private queue: string[] = [];

  private variableNames: { [ id: string ]: string } = {};
  private variableUnits: { [ id: string ]: string } = {};
  private mesocosmNames: { [ id: string ]: string } = {};

  constructor(private dateService: DateService, private chartDataService: ChartDataService,
              private metaDataService: MetaDataService, private decodeHtmlStringPipe: DecodeHtmlStringPipe) { }

  public downloadData(variables: Variable[], mesocosms: Mesocosm[], dateRange: DateRange): Observable<CsvData[]> {
    const days = this.dateService.getDayArrayFromDateRange(dateRange);
    variables.forEach(variable => this.variableNames[ variable.id ] = variable.name );
    variables.forEach(variable => this.variableUnits[ variable.id ] = this.decodeHtmlStringPipe.transform(variable.unit));
    mesocosms.forEach(mesocosm => this.mesocosmNames[ mesocosm.id ] = mesocosm.name );

    return forkJoin(variables.map(variable => this.downloadDataForVariable(variable.id, mesocosms, days).pipe(take(1))))
      .pipe(map(dataForVariable => dataForVariable.reduce((pV, cV) => cV.concat(pV), [])),
        map(data => data.map((csvData, index) => {
          csvData.id = index;
          return csvData;
        })))
  }

  public downloadMetaData(partner: Partner, dateRange: DateRange, data: CsvData[]): Observable<{ data: CsvData[], metaData: CsvMetaData[] }> {
    return this.metaDataService.getMetadataByPartnerIdAndDateRange(partner.id, dateRange)
      .pipe(
        take(1),
        map(metaData => metaData.map(data => this.metaDataToCsvObject(data, partner.displayName))),
        map(metaData => ({ data, metaData })))
  }

  public exportScoresAsCsv(data: {data: CsvData[], metaData: CsvMetaData[] }, partnerName: string) {
    const zip = new JSZip();
    zip.file(this.createCsvTitle(partnerName, 'data'), Papa.unparse(data.data));
    zip.file(
      this.createCsvTitle(partnerName, 'metadata'),
      data.metaData.length > 0 ? Papa.unparse(data.metaData) : 'No metadata found for this period.');

    zip.generateAsync({type:"blob"})
      .then((content: Blob) => saveAs(content, this.createZipTitle(partnerName)));
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
      unit: this.variableUnits[ mesocosmData.variableId ],
      mesocosm: this.mesocosmNames[ mesocosmData.mesocosmId ],
      time: this.dateService.format(timePoint.time, 'yyyy-MM-DD HH:mm'),
      value: timePoint.value
    }})
  }

  private metaDataToCsvObject(metaData: MetaData, partnerName: string): CsvMetaData {
    return {
      id: metaData.id,
      partner: partnerName,
      start: metaData.dateRange.start ? this.dateService.format(metaData.dateRange.start, 'yyyy-MM-DD') : '',
      end: metaData.dateRange.end ? this.dateService.format(metaData.dateRange.end, 'yyyy-MM-DD') : '',
      description: metaData.researchAim,
      contact: metaData.contact
    }
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

  private createCsvTitle(partnerName: string, type: string): string {
    return `${partnerName}_${type}_${this.dateService.format(new Date(), 'YYYY-MM-DD')}.csv`
  }

  private createZipTitle(partnerName: string): string {
    return `${partnerName}_${this.dateService.format(new Date(), 'YYYY-MM-DD')}.zip`
  }

}
