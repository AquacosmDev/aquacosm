import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, DocumentSnapshot, Query } from '@angular/fire/compat/firestore';
import { MesocosmData } from '@shr//models/mesocosm-data.model';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { collection, getDocs, limit, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MesocosmDataService extends FirebaseCollectionService<MesocosmData> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<MesocosmData>('mesocosmData'));
  }

  public getMesocosmDataByVariableAndMesocosm(variableId: string, mesocosmId: string): Observable<MesocosmData> {
    return this.getQueryRef(variableId, mesocosmId)
      .pipe(
        map(query => query.docs[ 0 ]),
        map(list => this.convertDocToItem(list as unknown as DocumentSnapshot<MesocosmData>)));
  }

  private getQueryRef(variableId: string, mesocosmId: string) {
    return from(getDocs(
      query(collection(this.db.firestore, 'mesocosmData'),
        where('variableId', '==', variableId),
        where('mesocosmId', '==', mesocosmId),
        limit(1))));
  }

  override convertItem(item:any): MesocosmData {
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }
}
