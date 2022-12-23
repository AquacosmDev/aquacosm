import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shr/shared.module';
import { LoginComponent } from '@app/admin/login/login.component';
import { AdminComponent } from '@app/admin/admin/admin.component';
import { AddPartnerComponent } from '@app/admin/admin/add-partner/add-partner.component';
import { LinkVariablesComponent } from '@app/admin/admin/add-partner/link-variables/link-variables.component';
import { ConnectPartnerComponent } from '@app/admin/admin/connect-partner/connect-partner.component';
import { MetaDataDetailComponent } from '@app/admin/admin/meta-data/meta-data-detail/meta-data-detail.component';
import { MetaDataComponent } from '@app/admin/admin/meta-data/meta-data.component';
import { AddEditorComponent } from './admin/meta-data/meta-data-detail/add-editor/add-editor.component';
import { AddMetaDataComponent } from './admin/meta-data/add-meta-data/add-meta-data.component';



@NgModule({
  declarations: [
    LoginComponent,
    AdminComponent,
    AddPartnerComponent,
    LinkVariablesComponent,
    ConnectPartnerComponent,
    MetaDataDetailComponent,
    MetaDataComponent,
    AddEditorComponent,
    AddMetaDataComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class AdminModule { }
