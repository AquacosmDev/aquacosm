import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { AngularFirestore, CollectionReference, DocumentSnapshot, Query } from '@angular/fire/compat/firestore';
import { map, Observable, take } from 'rxjs';
import { Mesocosm } from '@shr//models/mesocosm.model';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesocosmService extends FirebaseCollectionService<Mesocosm> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Mesocosm>('mesocosm'));
  }

  public getMesocosms(mesocosmIds: string[]): Observable<Mesocosm[]> {
    return combineLatest(mesocosmIds.map(mesocosmId => this.get(mesocosmId).pipe(take(1))));
  }

  public getMesocosmByPartnerId(partnerId: string): Observable<Mesocosm[]> {
    return this.db.collection<Mesocosm>('mesocosm', ref => this.getQueryRef(ref, partnerId))
      .snapshotChanges()
      .pipe(map(list => list.map(documentChangeAction =>
        this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<Mesocosm>))));
  }

  private getQueryRef(ref: CollectionReference, partnerId?: string): CollectionReference | Query {
    if (partnerId) {
      ref.where('partnerId', '==', partnerId);
    }
    return ref;
  }
}
