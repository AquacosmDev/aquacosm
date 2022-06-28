import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { Variable } from '@shr//models/variable.model';
import { AngularFirestore, CollectionReference, DocumentSnapshot, Query } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Mesocosm } from '@shr//models/mesocosm.model';

@Injectable({
  providedIn: 'root'
})
export class VariableService extends FirebaseCollectionService<Variable> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Variable>('variable'));
  }

  public getVariableByPartnerId(partnerId: string): Observable<Variable[]> {
    return this.db.collection<Variable>('variable', ref => ref
      .where('partnerId', '==', partnerId))
      .snapshotChanges().pipe(map(list => list.map(documentChangeAction =>
        this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<Variable>))));
  }

  public getNumberOfVariablesPerPartner(partnerId: string): Observable<number> {
    return this.getVariableByPartnerId(partnerId)
      .pipe(map(variables => variables.length));
  }

  private getQueryRef(ref: CollectionReference, partnerId?: string): CollectionReference | Query {
    if (partnerId) {
      ref.where('partnerId', '==', partnerId);
    }
    return ref;
  }
}
