import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { take, takeUntil } from 'rxjs';
import { PartnerService } from '@core/collections/partner.service';
import { Partner } from '@shr/models/partner-model';
import { MetaDataService } from '@core/collections/meta-data.service';
import { Router } from '@angular/router';
import { MetaData } from '@shr/models/meta-data.model';

@Component({
  selector: 'aqc-add-meta-data',
  templateUrl: './add-meta-data.component.html',
  styleUrls: ['./add-meta-data.component.scss']
})
export class AddMetaDataComponent extends SimpleModalComponent<{ }, any> implements OnInit {
  public partners!: Partner[];
  public selectedPartner!: Partner;

  constructor(private partnerService: PartnerService, private metaDataService: MetaDataService,
              private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.getPartners();
  }

  public selectPartner(partner: Partner) {
    this.selectedPartner = partner;
  }

  public addMetadataEntry() {
    if(this.selectedPartner) {
      const newMetaData: MetaData = {
        partnerId: this.selectedPartner.id,
        history: []
      }
      this.metaDataService.add(newMetaData)
        .subscribe(metadata => {
          this.close();
          this.router.navigate([ 'admin', 'meta-data', metadata.id ]);
        })
    }
  }

  private getPartners() {
    this.partnerService.getAll()
      .pipe(take(1))
      .subscribe(partners => {
        this.partners = partners;
      });
  }
}
