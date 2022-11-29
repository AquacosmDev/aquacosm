import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { map, Observable, of, take, tap } from 'rxjs';
import { Mesocosm } from '@shr//models/mesocosm.model';
import { CollectionService } from '@core/collections/collection.service';

@Injectable({
  providedIn: 'root'
})
export class MesocosmService extends CollectionService<Mesocosm> {

  private mesocosms: { [id: string]: Mesocosm } = {};

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Mesocosm>('mesocosm'));
  }

  public override get(id: string): Observable<Mesocosm> {
    return this.exists(id) ? of(this.mesocosms[ id ]) :
      super.get(id)
        .pipe(
          take(1),
          tap(mesocosm => this.mesocosms[ id ] = mesocosm));
  }

  public getMesocosmByPartnerId(partnerId: string): Observable<Mesocosm[]> {
    return this.db.collection<Mesocosm>('mesocosm', ref => ref
        .where('partnerId', '==', partnerId))
        .snapshotChanges()
      .pipe(
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<Mesocosm>))),
        tap(list => list.forEach(mesocosm => this.mesocosms[ mesocosm.id! ] = mesocosm)));
  }

  public getNumberOfMesocosmsPerPartner(partnerId: string): Observable<number> {
    return this.getMesocosmByPartnerId(partnerId)
      .pipe(map(mesocosms => mesocosms.length));
  }

  public getMesocosmsByPartnerIdSortedByName(partnerId: string): Observable<Mesocosm[]> {
    return this.getMesocosmByPartnerId(partnerId)
      .pipe(
        map((mesocosms: Mesocosm[]) => {
        mesocosms.sort((a: Mesocosm, b: Mesocosm) => {
          if (a.name < b.name) {
            return -1;
          }
          if (b.name > a.name) {
            return 1;
          }
          return 0;
        });
        return mesocosms;
      }));
  }

  public exists(id: string): boolean {
    return !!this.mesocosms[ id ];
  }
}
