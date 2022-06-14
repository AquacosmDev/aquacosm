import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkInProgressComponent } from '@app/work-in-progress/work-in-progress.component';
import { PartnerComponent } from '@ptn/partner/partner.component';
import { PartnerDetailComponent } from '@ptn/partner/partner-detail/partner-detail.component';

const routes: Routes = [
  { path: '', component: WorkInProgressComponent },
  { path: 'home', component: PartnerComponent },
  { path: 'partner/:name', component: PartnerDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
