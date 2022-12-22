import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionService } from '@core/collections/collection.service';
import { Profile } from '@shr/models/profile.model';
import { DateRange } from '@shr/models/date-range.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends CollectionService<Profile> {

  constructor(db: AngularFirestore) {
    super(db);
    this.path = 'profile';
    this.setCollection(db.collection<Profile>('profile'));
  }

  public getProfilesByPartnerAndDate(partnerId: string, dateRange: DateRange): Observable<Profile[]> {
    if (!partnerId || !dateRange) {
      debugger;
    }
    return this.db.collection<Profile>('profile', ref => ref
        .where('partnerId', '==', partnerId)
        .where('startTime', '>', dateRange.start)
        .where('startTime', '<', dateRange.end)
        .orderBy('startTime', 'desc'))
      .get()
      .pipe(map(profiles => profiles.docs.map(profile => this.convertDocToItem(profile))));
  }

  override convertItem(item:any): Profile {
    if (!!item.startTime) {
      item.startTime = item.startTime.toDate();
    }
    item.data.forEach((timePoint: any) => {
      timePoint.time = timePoint.time.toDate();
    });

    return item;
  }
}
