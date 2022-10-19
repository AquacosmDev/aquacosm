import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { Error } from '@shr/models/error.model';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { from, map, Observable, tap } from 'rxjs';
import { collection, getDocs, limit, query, where } from '@angular/fire/firestore';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';

@Injectable({
  providedIn: 'root'
})
export class MetaDataEditorService extends FirebaseCollectionService<MetaDataEditor> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<MetaDataEditor>('metaDataEditor'));
  }

  public getMetaDataEditor(email: string, password: string, metaDataId: string): Observable<MetaDataEditor> {
    return from(getDocs(
      query(collection(this.db.firestore, 'metaDataEditor'),
        where('email', '==', email),
        where('password', '==', password),
        where('metaDataId', '==', metaDataId),
        limit(1))))
      .pipe(
        tap(query => console.log(query)),
        map(query => !!query.docs[ 0 ] ?
          this.convertDocToItem(query.docs[ 0 ] as unknown as DocumentSnapshot<MetaDataEditor>) : null));
  }

  public getEditors(metaDataId: string): Observable<MetaDataEditor[]> {
    return from(getDocs(
      query(collection(this.db.firestore, 'metaDataEditor'),
        where('metaDataId', '==', metaDataId),
        limit(1))))
      .pipe(
        tap(query => console.log(query)),
        map(query => query.docs.map(doc => this.convertDocToItem(doc as unknown as DocumentSnapshot<MetaDataEditor>))));
  }
}
