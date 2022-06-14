import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MesocosmDataService } from '@core/collections/mesocosm-data.service';
import { PartnerService } from '@core/collections/partner.service';
import { DateService } from '@core/date.service';



@NgModule({
  providers: [
    MesocosmDataService,
    PartnerService,
    DateService
  ]
})
export class CoreModule {
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
