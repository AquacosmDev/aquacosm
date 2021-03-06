import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkInProgressComponent } from '@app/work-in-progress/work-in-progress.component';
import { PartnerComponent } from '@ptn/partner/partner.component';
import { PartnerDetailComponent } from '@ptn/partner/partner-detail/partner-detail.component';
import { LoginComponent } from '@app/admin/login/login.component';
import { AdminComponent } from '@app/admin/admin/admin.component';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectLoggedInToItems = () => redirectLoggedInTo(['admin']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: '', component: WorkInProgressComponent },
  { path: 'home', component: PartnerComponent },
  { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToItems } },
  { path: 'admin', component: AdminComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }  },
  { path: 'partner/:name', component: PartnerDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
