import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shr//shared.module';
import { PartnerComponent } from '@ptn/partner/partner.component';
import { PartnerDetailComponent } from '@ptn/partner/partner-detail/partner-detail.component';
import { VariableChartComponent } from '@ptn/partner/variable-chart/variable-chart.component';
import { TimeRangeSelectorComponent } from '@ptn/partner/time-range-selector/time-range-selector.component';



@NgModule({
  declarations: [
    PartnerComponent,
    PartnerDetailComponent,
    VariableChartComponent,
    TimeRangeSelectorComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class PartnerModule { }
