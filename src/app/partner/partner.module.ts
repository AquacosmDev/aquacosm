import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerComponent } from './partner/partner.component';
import { SharedModule } from '@shr//shared.module';
import { PartnerDetailComponent } from './partner/partner-detail/partner-detail.component';
import { VariableChartComponent } from './partner/variable-chart/variable-chart.component';
import { TimeRangeSelectorComponent } from './partner/time-range-selector/time-range-selector.component';



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
