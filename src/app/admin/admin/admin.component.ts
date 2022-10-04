import { Component, OnDestroy, OnInit } from '@angular/core';
import { AddPartnerComponent } from '@app/admin/admin/add-partner/add-partner.component';
import { SimpleModalService } from 'ngx-simple-modal';
import { PartnerService } from '@core/collections/partner.service';
import { Partner } from '@shr/models/partner-model';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { VariableService } from '@core/collections/variable.service';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { ConnectPartnerComponent } from '@app/admin/admin/connect-partner/connect-partner.component';

@Component({
  selector: 'aqc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  public partners!: Partner[];
  public partnerMetrics = {} as { [partnerId: string]: { variables: number, mesocosms: number }}

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private simpleModalService: SimpleModalService, private partnerService: PartnerService,
              private variableService: VariableService, private mesocosmService: MesocosmService) { }

  ngOnInit(): void {
    this.getPartners();
    this.connectPartner();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public addPartner() {
    this.simpleModalService.addModal(AddPartnerComponent, {});
  }

  public editPartner(partner: Partner) {
    this.simpleModalService.addModal(AddPartnerComponent, { partner: partner });
  }

  public connectPartner() {
    this.simpleModalService.addModal(ConnectPartnerComponent, {});
  }

  private getPartners() {
    this.partnerService.getAll()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(partners => {
        this.partners = partners;
        this.partners.forEach(partner => {
          this.partnerMetrics[ partner.id! ] = { variables: 0, mesocosms: 0 }
          this.variableService.getNumberOfVariablesPerPartner(partner.id!)
            .pipe(take(1))
            .subscribe(variables => this.partnerMetrics[ partner.id! ].variables = variables);
          this.mesocosmService.getNumberOfMesocosmsPerPartner(partner.id!)
            .pipe(take(1))
            .subscribe(mesocosms => this.partnerMetrics[ partner.id! ].mesocosms = mesocosms);
        })
      });
  }

}
