import { Injectable } from '@angular/core';
import { Variable } from '@shr//models/variable.model';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { map, Observable, of, take, tap } from 'rxjs';
import { CollectionService } from '@core/collections/collection.service';

@Injectable({
  providedIn: 'root'
})
export class VariableService extends CollectionService<Variable> {

  private variables: { [id: string]: Variable } = {};

  constructor(db: AngularFirestore) {
    super(db);
    this.setCollection(db.collection<Variable>('variable'));
  }

  public override get(id: string): Observable<Variable> {
    return this.exists(id) ? of(this.variables[id]) :
      super.get(id)
        .pipe(
          take(1),
          tap(variable => this.variables[id] = variable));
  }

  public getVariableByPartnerId(partnerId: string): Observable<Variable[]> {
    return this.db.collection<Variable>('variable', ref => ref
      .where('partnerId', '==', partnerId))
      .snapshotChanges().pipe(map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<Variable>))),
        tap(list => list.forEach(variable => this.variables[variable.id!] = variable)));
  }

  public getNumberOfVariablesPerPartner(partnerId: string): Observable<number> {
    return this.getVariableByPartnerId(partnerId)
      .pipe(map(variables => variables.length));
  }

  public exists(id: string): boolean {
    return !!this.variables[id];
  }
}
