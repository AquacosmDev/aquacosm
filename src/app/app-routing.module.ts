import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnerComponent } from '@ptn/partner/partner.component';
import { PartnerDetailComponent } from '@ptn/partner/partner-detail/partner-detail.component';
import { LoginComponent } from '@app/admin/login/login.component';
import { AdminComponent } from '@app/admin/admin/admin.component';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { MetaDataComponent } from '@app/admin/admin/meta-data/meta-data.component';
import { MetaDataDetailComponent } from '@app/admin/admin/meta-data/meta-data-detail/meta-data-detail.component';
import { PartnerMetadataComponent } from '@ptn/partner/partner-metadata/partner-metadata.component';
import { PartnerProfilesComponent } from '@ptn/partner/partner-profiles/partner-profiles.component';

const redirectLoggedInToItems = () => redirectLoggedInTo(['admin']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: '', component: PartnerComponent },
  { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToItems } },
  { path: 'admin', component: AdminComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }  },
  { path: 'admin/meta-data', component: MetaDataComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }  },
  { path: 'admin/meta-data/:id', component: MetaDataDetailComponent },
  { path: 'partner/:name', component: PartnerDetailComponent },
  { path: 'partner/:name/meta-data', component: PartnerMetadataComponent },
  { path: 'partner/:name/profiles', component: PartnerProfilesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
