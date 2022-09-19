import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, filter, map, Observable, Subject, Subscription, take } from 'rxjs';
import { LastUpload } from '@shr/models/last-upload.model';

@Injectable({
  providedIn: 'root'
})
export class LastUploadTimeService {

  private lastUploadTime = new BehaviorSubject<Date>(null);
  private partnerId!: string;

  private subscription!: Subscription;

  constructor(private db: AngularFirestore) { }

  public getLastUploadDateByPartnerId$(partnerId: string): Observable<Date> {
    if(this.partnerId !== partnerId) {
      if(!!this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      this.subscription = this.db.collection<LastUpload>('lastUpload', ref => ref
        .where('partnerId', '==', partnerId)
        .limit(1))
        .snapshotChanges()
        .pipe(
          map(list => list[0].payload.doc.data().date.toDate()))
        .subscribe(date => this.lastUploadTime.next(date));
    }

    return this.lastUploadTime.asObservable().pipe(filter(date => !!date));
  }

  public getLastUploadDateByPartnerId(partnerId: string): Observable<Date> {
    return this.getLastUploadDateByPartnerId$(partnerId)
      .pipe(take(1));
  }

  public getLastUploadDate(): Observable<Date> {
    return this.lastUploadTime.asObservable()
      .pipe(filter(date => !!date));
  }
}
