import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { from, map, Observable } from 'rxjs';
import { collection, getDocs, limit, query, where } from '@angular/fire/firestore';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { CollectionService } from '@core/collections/collection.service';

@Injectable({
  providedIn: 'root'
})
export class MetaDataEditorService extends CollectionService<MetaDataEditor> {
  private library = '0123456789'

  constructor(db: AngularFirestore) {
    super(db);
    this.path = 'metaDataEditor';
    this.setCollection(db.collection<MetaDataEditor>('metaDataEditor'));
  }

  public addWithoutPassword(editor: MetaDataEditor): Observable<MetaDataEditor> {
    editor.password = this.generatePassword();

    return this.add(editor);
  }

  public getMetaDataEditor(email: string, password: string, metaDataId: string): Observable<MetaDataEditor> {
    return from(getDocs(
      query(collection(this.db.firestore, 'metaDataEditor'),
        where('email', '==', email),
        where('password', '==', password),
        where('metaDataId', '==', metaDataId),
        limit(1))))
      .pipe(
        map(query => !!query.docs[0] ?
          this.convertDocToItem(query.docs[0] as unknown as DocumentSnapshot<MetaDataEditor>) : null));
  }

  public getEditors(metaDataId: string): Observable<MetaDataEditor[]> {
    return this.db.collection<Mesocosm>('metaDataEditor', ref => ref
      .where('metaDataId', '==', metaDataId))
      .snapshotChanges()
      .pipe(
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<MetaDataEditor>))));
  }

  private generatePassword(): string {
    let password = 'Aquacosm-';
    for (let i = 0; i < 5; i++) {
      password += this.library[Math.floor(Math.random() * this.library.length)];
    }
    return password;
  }
}
