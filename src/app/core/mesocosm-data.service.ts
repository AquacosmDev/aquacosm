import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { MesocosmData } from '../shared/models/mesocosm-data.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesocosmDataService extends FirebaseCollectionService<MesocosmData> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<MesocosmData>('mesocosmData'));
  }

  override get(id: string): Observable<MesocosmData> {
    return this.db.collection<MesocosmData>('mesocosmData').doc<MesocosmData>(id).snapshotChanges()
        .pipe(
          map(doc => {
            let item = doc.payload.data() as MesocosmData;
            (item as any).id = doc.payload.id;
            item = this.convertItem(item);
            return item;
          })
        );
  }

  override convertItem(item:any): MesocosmData {
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }
}
