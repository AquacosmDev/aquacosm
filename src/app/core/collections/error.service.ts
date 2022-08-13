import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Error } from '@shr//models/error.model';
import { from, map, Observable } from 'rxjs';
import { collection, getDocs, limit, query, where } from '@angular/fire/firestore';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { MesocosmData } from '@shr/models/mesocosm-data.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorService extends FirebaseCollectionService<Error> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Error>('error'));
  }

  public getErrors(): Observable<Error[]> {
    return from(getDocs(
      query(collection(this.db.firestore, 'error'),
        limit(50))))
      .pipe(
        map(query => query.docs.map(doc => this.convertDocToItem(doc as unknown as DocumentSnapshot<Error>))));
  }

}
