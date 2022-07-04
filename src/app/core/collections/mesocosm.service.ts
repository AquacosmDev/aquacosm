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

  public getMesocosmByPartnerId(partnerId: string): Observable<Mesocosm[]> {
    return this.db.collection<Mesocosm>('mesocosm', ref => ref
      .where('partnerId', '==', partnerId))
      .snapshotChanges().pipe(map(list => list.map(documentChangeAction =>
        this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<Mesocosm>))));
  }

  public getNumberOfMesocosmsPerPartner(partnerId: string): Observable<number> {
    return this.getMesocosmByPartnerId(partnerId)
      .pipe(map(mesocosms => mesocosms.length));
  }

  public getMesocosmsByPartnerIdSortedByName(partnerId: string): Observable<Mesocosm[]> {
    return this.getMesocosmByPartnerId(partnerId)
      .pipe(map((mesocosms: Mesocosm[]) => {
        mesocosms.sort((a: Mesocosm, b: Mesocosm) => {
          if (a.name < b.name) {
            return -1;
          }
          if (b.name > a.name) {
            return 1;
          }
          return 0;
        });
        return mesocosms;
      }));
  }
}
