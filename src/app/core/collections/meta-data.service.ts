import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { from, map, Observable, tap } from 'rxjs';
import { collection, getDocs, limit, query, where } from '@angular/fire/firestore';
import { MetaData } from '@shr/models/meta-data.model';

@Injectable({
  providedIn: 'root'
})
export class MetaDataService extends FirebaseCollectionService<MetaData> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<MetaData>('metaData'));
  }

  // public getMetaData(email: string, password: string, metaDataId: string): Observable<MetaData> {
  //   return from(getDocs(
  //     query(collection(this.db.firestore, 'metaDataEditor'),
  //       where('email', '==', email),
  //       where('password', '==', password),
  //       where('metaDataId', '==', metaDataId),
  //       limit(1))))
  //     .pipe(
  //       tap(query => console.log(query)),
  //       map(query => !!query.docs[ 0 ] ?
  //         this.convertDocToItem(query.docs[ 0 ] as unknown as DocumentSnapshot<MetaData>) : null));
  // }
}
