import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { MetaData } from '@shr/models/meta-data.model';
import { DateRange } from '@shr/models/date-range.model';
import { DateService } from '@core/date.service';
import { CollectionService } from '@core/collections/collection.service';

@Injectable({
  providedIn: 'root'
})
export class MetaDataService extends CollectionService<MetaData> {

  constructor(db: AngularFirestore, private dateService: DateService) {
    super(db);
    this.setCollection(db.collection<MetaData>('metaData'));
  }

  public getMetadataByPartnerId(partnerId: string): Observable<MetaData[]> {
    return this.db.collection<MetaData>('metaData', ref => ref
      .where('partnerId', '==', partnerId))
      .snapshotChanges()
      .pipe(
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<MetaData>))),
        map(list => list.filter(metadata => !!metadata.dateRange)));
  }

  public getMetadataByPartnerIdAndDateRange(partnerId: string, dateRange: DateRange): Observable<MetaData[]> {
    return this.db.collection<MetaData>('metaData', ref => ref
      .where('partnerId', '==', partnerId))
      .snapshotChanges()
      .pipe(
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<MetaData>))),
        map(list => list.filter(metadata => {
          const range = {...metadata.dateRange};
          if (range && !range.end) {
            range.end = this.dateService.addDays(new Date(), 1);
          }
          return !!metadata.dateRange && this.dateService.isDateRangeWithinDateRange(dateRange, range)
        })));
  }

  protected override convertItem(item: any): MetaData {
    if (!!item.dateRange && !!item.dateRange.start) {
      item.dateRange.start = item.dateRange.start.toDate();
    }
    if (!!item.dateRange && !!item.dateRange.end) {
      item.dateRange.end = item.dateRange.end.toDate();
    }

    if (!!item.history) {
      item.history.forEach((history: any) => {
        history.date = history.date.toDate();
      });
    }
    return item as MetaData;
  }
}
