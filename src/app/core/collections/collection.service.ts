import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, from, Observable, of, tap, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot, QuerySnapshot
} from '@angular/fire/compat/firestore';
import { documentId, FieldPath } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CollectionService<T> {
  public path: string;
  private collection = new BehaviorSubject<AngularFirestoreCollection<T> | null>(null);

  constructor(protected db: AngularFirestore) {
  }

  public get(id: string): Observable<T> {
    return this.getFrom(id, 'cache')
      .pipe(
        switchMap(snapshot => !!snapshot ? of(snapshot) : this.getFrom(id, 'server')),
        filter(snapshot => snapshot.empty),
        map(snapshot => this.convertDocToItem(snapshot.docs[ 0 ])));
  }

  public getAll(): Observable<T[]> {
    return this.getCollection$()
      .pipe(
        switchMap(col => !!col ? col.snapshotChanges() : of([])),
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<T>))));
  }

  public add(item: T): Observable<T> {
    delete (item as any).id;
    return this.getCurrentCollection()
      .pipe(
        switchMap(col => col.add(item)),
        switchMap(document => from(document.get())),
        map(doc => this.convertDocToItem(doc as DocumentSnapshot<T>)));
  }

  public update(item: T): Observable<T> {
    return this.getCurrentCollection()
      .pipe(
        switchMap(col => col.doc((item as any).id).update(item)),
        map(() => item));
  }

  public delete(item: T): Observable<void> {
    return this.getCurrentCollection()
      .pipe(switchMap(col => col.doc((item as any).id).delete()));
  }

  protected convertItem(item: any): T {
    return item;
  }

  protected setCollection(collection: AngularFirestoreCollection<T> | null): void {
    this.collection.next(collection as AngularFirestoreCollection<T>);
  }

  protected convertDocToItem(doc: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): T {
    let item = doc.data() as T;
    (item as any).id = (doc as any).id;
    item = this.convertItem(item);
    return item;
  }

  protected fromCache(collection: AngularFirestoreCollection<T>): Observable<QuerySnapshot<T>> {
    return this.fromSource(collection, 'cache')
      .pipe(
        switchMap(snapshot => snapshot.empty ? this.fromSource(collection, 'server') : of(snapshot)));
  }

  protected fromSource(collection: AngularFirestoreCollection<T>, source: 'cache' | 'server'): Observable<QuerySnapshot<T>> {
    return collection.get({ source: source});
  }

  private getCollection$(): Observable<AngularFirestoreCollection<T> | null> {
    return this.collection.asObservable();
  }

  private getCurrentCollection(): Observable<AngularFirestoreCollection<T>> {
    return this.getCollection$()
      .pipe(take(1), switchMap(col => !!col ? of(col) : throwError(new Error('Collection does not exist'))));
  }

  private getFrom(id: string, source: 'cache' | 'server'): Observable<QuerySnapshot<T>> {
    return this.fromSource(this.db.collection<T>(this.path, ref => {
      let query : Query = ref;
      query = query.where(documentId(), '==', id);
      return query;
    }), source);
  }
}
