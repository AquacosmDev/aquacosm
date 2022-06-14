import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, DocumentSnapshot, Query } from '@angular/fire/compat/firestore';
import { Partner } from '@shr//models/partner-model';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartnerService  extends FirebaseCollectionService<Partner> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Partner>('partner'));
  }

  public getPartnerByName(name: string): Observable<Partner> {
    return this.db.collection<Partner>('partner', ref => this.getQueryRef(ref, name))
      .snapshotChanges()
      .pipe(map(list => this.convertDocToItem(list[ 0 ].payload.doc as DocumentSnapshot<Partner>)));
  }

  private getQueryRef(ref: CollectionReference, name?: string): CollectionReference | Query {
    if (name) {
      ref.where('name', '==', name);
    }
    return ref.limit(1);
  }
}
