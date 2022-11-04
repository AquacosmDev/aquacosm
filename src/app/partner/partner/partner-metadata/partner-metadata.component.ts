import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetaData } from '@shr/models/meta-data.model';
import { from, map, Observable, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { MetaDataService } from '@core/collections/meta-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddMetaDataComponent } from '@app/admin/admin/meta-data/add-meta-data/add-meta-data.component';
import { Partner } from '@shr/models/partner-model';
import { PartnerService } from '@core/collections/partner.service';
import { DateService } from '@core/date.service';

@Component({
  selector: 'aqc-partner-metadata',
  templateUrl: './partner-metadata.component.html',
  styleUrls: ['./partner-metadata.component.scss']
})
export class PartnerMetadataComponent implements OnInit, OnDestroy {
  public partner!: Partner;
  public metaData!: MetaData[];


  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private metaDataService: MetaDataService, private router: Router,
              private afAuth: AngularFireAuth, private simpleModalService: SimpleModalService,
              private route: ActivatedRoute, private partnerService: PartnerService,
              private dateService: DateService) { }

  ngOnInit(): void {
    this.getPartner()
      .subscribe(partner => {
        this.partner = partner;
        this.getMetaData(partner.id);
      })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public toPartnerOverview() {
    this.router.navigate([ 'partner', this.partner.name ]);
  }

  private getPartner(): Observable<Partner> {
    return this.route.params
      .pipe(
        take(1),
        map(params => params['name']),
        switchMap(name => this.partnerService.getPartnerByName(name).pipe(take(1))))
  }

  private getMetaData(partnerId: string) {
    this.metaDataService.getMetadataByPartnerId(partnerId)
      .pipe(
        takeUntil(this.destroyed$),
        map(metaData => metaData.sort((a, b) => this.dateService.getDifferenceInMinutes({ start: a.dateRange.start, end: b.dateRange.start }))))
      .subscribe(metaData => this.metaData = metaData);
  }

}
