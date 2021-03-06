import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/compat/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { HttpClientModule } from '@angular/common/http';
import { WorkInProgressComponent } from './work-in-progress/work-in-progress.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { PartnerModule } from '@ptn/partner.module';
import { SharedModule } from '@shr/shared.module';
import { CoreModule } from '@core/core.module';
import { environment } from '@env/environment';
import { AdminModule } from '@app/admin/admin.module';
import { defaultSimpleModalOptions, SimpleModalModule } from 'ngx-simple-modal';
import { NgxPopperjsModule } from 'ngx-popperjs';

@NgModule({
  declarations: [
    AppComponent,
    WorkInProgressComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
    SharedModule,
    CoreModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    PartnerModule,
    AdminModule,
    SimpleModalModule.forRoot({container:document.body}, {...defaultSimpleModalOptions, ...{
        closeOnEscape: true,
        closeOnClickOutside: true,
      }}),
    NgxPopperjsModule
  ],
  providers: [
    // { provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
