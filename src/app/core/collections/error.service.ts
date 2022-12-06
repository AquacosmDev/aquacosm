import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Error } from '@shr//models/error.model';
import { from, map, Observable } from 'rxjs';
import { collection, getDocs, limit, query } from '@angular/fire/firestore';
import { CollectionService } from '@core/collections/collection.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService extends CollectionService<Error> {

  constructor(db: AngularFirestore) {
    super(db);
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
