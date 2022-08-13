import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Partner } from '@shr//models/partner-model';
import { FirebaseCollectionService } from '@ternwebdesign/firebase-store';
import { map, Observable, of, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartnerService  extends FirebaseCollectionService<Partner> {

  private partners: { [name: string]: Partner } = {};
  private getAllDone = false;

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Partner>('partner'));
  }

  public override getAll(): Observable<Partner[]> {
    return this.getAllDone ? of(this.getAllFromObject()) :
      super.getAll()
        .pipe(
          take(1),
          tap(list => {
            list.forEach(partner => this.partners[ partner.id! ] = partner);
            this.getAllDone = true;
          }));
  }

  public getPartnerByName(name: string): Observable<Partner> {
    return this.exists(name) ? of(this.partners[ name ]) :
      this.db.collection<Partner>('partner', ref => ref
        .where('name', '==', name))
        .snapshotChanges()
        .pipe(
          map(list => this.convertDocToItem(list[ 0 ].payload.doc as DocumentSnapshot<Partner>)),
          tap(partner => this.partners[ partner.name ] = partner));
  }

  public getAllFromObject(): Partner[] {
    return Object.keys(this.partners).map(key => this.partners[ key ]);
  }

  public exists(name: string): boolean {
    return !!this.partners[ name ];
  }
}
