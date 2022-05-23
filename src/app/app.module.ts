import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/compat/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { HttpClientModule } from '@angular/common/http';
import { WorkInProgressComponent } from './work-in-progress/work-in-progress.component';
import { ChartExampleComponent } from './chart-example/chart-example.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

@NgModule({
  declarations: [
    AppComponent,
    WorkInProgressComponent,
    ChartExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
    SharedModule,
    CoreModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule
  ],
  providers: [
    // { provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
