import { Component, OnDestroy, OnInit } from '@angular/core';
import { Partner } from '@shr//models/partner-model';
import { PartnerService } from '@core/collections/partner.service';
import { Router } from '@angular/router';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'aqc-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss']
})
export class PartnerComponent implements OnInit, OnDestroy {

  public partners!: Partner[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private partnerService: PartnerService, private router: Router) { }

  ngOnInit(): void {
    this.getPartners();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public navigateToPartner(id: string) {
    this.router.navigate([ '/partner', id ]);
  }

  private getPartners() {
    this.partnerService.getAll()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(partners => this.partners = partners)
  }

}
