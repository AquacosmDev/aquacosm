import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MetaData } from '@shr/models/meta-data.model';
import { from, ReplaySubject, take, takeUntil } from 'rxjs';
import { PartnerService } from '@core/collections/partner.service';
import { Partner } from '@shr/models/partner-model';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DeviceService } from '@core/device.service';

@Component({
  selector: 'aqc-meta-data-summary',
  templateUrl: './meta-data-summary.component.html',
  styleUrls: ['./meta-data-summary.component.scss']
})
export class MetaDataSummaryComponent implements OnInit, OnDestroy {
  @Input() metaData!: MetaData;
  @Input() editable = false;

  public partner!: Partner;

  public isMobile = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private partnerService: PartnerService, private router: Router,
              private deviceService: DeviceService) { }

  ngOnInit(): void {
    this.getPartner();
    this.getIsMobile();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public editMetaData() {
    this.router.navigate([ 'admin', 'meta-data', this.metaData.id ]);
  }

  private getPartner() {
    this.partnerService.get(this.metaData.partnerId)
      .pipe(take(1))
      .subscribe(partner => this.partner = partner);
  }

  private getIsMobile() {
    this.deviceService.isMobile()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isMobile => this.isMobile = isMobile);
  }
}
