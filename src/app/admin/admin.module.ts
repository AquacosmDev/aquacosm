import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shr/shared.module';
import { LoginComponent } from '@app/admin/login/login.component';
import { AdminComponent } from '@app/admin/admin/admin.component';
import { AddPartnerComponent } from './admin/add-partner/add-partner.component';
import { LinkVariablesComponent } from './admin/add-partner/link-variables/link-variables.component';



@NgModule({
  declarations: [
    LoginComponent,
    AdminComponent,
    AddPartnerComponent,
    LinkVariablesComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class AdminModule { }
