import { Injectable } from '@angular/core';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { MesocosmData } from '../shared/models/mesocosm-data.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MesocosmDataService extends FirebaseCollectionService<MesocosmData> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<MesocosmData>('mesocosmData'));
  }

  override convertItem(item:any): MesocosmData {
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }
}
