import {Injectable} from '@angular/core';
import {first, map, skip, switchMap, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private afAuth: AngularFireAuth) { }

  canActivate(): Observable<boolean> {
    return this.isLoggedIn().pipe(
      switchMap(isLoggedIn => !isLoggedIn ? this.isSubscribed() : of(isLoggedIn)));
  }

  private isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(first(), map(user => !!user));
  }

  private isSubscribed(): Observable<boolean> {
    return this.subscriptionService.getByUserId()
      .pipe(
        switchMap(subscription => subscription.plan !== 'beta' && this.dateService.isAfter(new Date(), subscription.subscribedTo) ?
          this.showSubscriptionModal(subscription) : of(subscription)),
        tap(subscription => subscription.plan !== 'beta' && this.dateService.isAfter(new Date(), subscription.subscribedTo) ?
          this.navigationService.navigateToUserInfo() : null),
        map(subscription => !(subscription.plan !== 'beta' && this.dateService.isAfter(new Date(), subscription.subscribedTo))));
  }

  private showSubscriptionModal(subscription: Subscription): Observable<Subscription> {
    return this.modalService.init(ResubscribeComponent, { subscription: subscription}, {})
      .pipe(skip(1), map(() => subscription));
  }
}
