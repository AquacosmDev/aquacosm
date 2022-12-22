import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shr//shared.module';
import { PartnerComponent } from '@ptn/partner/partner.component';
import { PartnerDetailComponent } from '@ptn/partner/partner-detail/partner-detail.component';
import { VariableChartComponent } from '@ptn/partner/variable-chart/variable-chart.component';
import { DownloadDataModalComponent } from './partner/download-data-modal/download-data-modal.component';
import { PartnerMetadataComponent } from './partner/partner-metadata/partner-metadata.component';
import { PartnerProfilesComponent } from './partner/partner-profiles/partner-profiles.component';
import { ProfileSelectorComponent } from './partner/partner-profiles/profile-selector/profile-selector.component';
import { ProfileChartsComponent } from './partner/partner-profiles/profile-charts/profile-charts.component';
import { ProfileChartComponent } from './partner/partner-profiles/profile-charts/profile-chart/profile-chart.component';
import { DownloadProfileModalComponent } from './partner/partner-profiles/download-profile-modal/download-profile-modal.component';



@NgModule({
    declarations: [
        PartnerComponent,
        PartnerDetailComponent,
        VariableChartComponent,
        DownloadDataModalComponent,
        PartnerMetadataComponent,
        PartnerProfilesComponent,
        ProfileSelectorComponent,
        ProfileChartsComponent,
        ProfileChartComponent,
        DownloadProfileModalComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class PartnerModule { }
