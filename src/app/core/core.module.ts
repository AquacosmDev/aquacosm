import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MesocosmDataService } from './mesocosm-data.service';



@NgModule({
  providers: [
    MesocosmDataService
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
