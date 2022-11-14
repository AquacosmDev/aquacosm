import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './components/chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { ChecklistComponent } from './components/checklist/checklist.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DateRangeInputComponent } from './components/date-range-input/date-range-input.component';
import { FormsModule } from '@angular/forms';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { StepperComponent } from './components/stepper/stepper.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { DecodeHtmlStringPipe } from './pipes/decode-html-string.pipe';
import { NgxPopperjsModule } from 'ngx-popperjs';
import { LoadingComponent } from './components/loading/loading.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgSelectModule } from '@ng-select/ng-select';
import { TimeRangeSelectorComponent } from '@shr/components/time-range-selector/time-range-selector.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MetaDataSummaryComponent } from '@shr/components/meta-data-summary/meta-data-summary.component';
import { SearchComponent } from './components/search/search.component';


@NgModule({
  declarations: [
    ChartComponent,
    ChecklistComponent,
    CheckboxComponent,
    DateRangeInputComponent,
    StepperComponent,
    ListItemComponent,
    DecodeHtmlStringPipe,
    LoadingComponent,
    TimeRangeSelectorComponent,
    ConfirmModalComponent,
    MetaDataSummaryComponent,
    SearchComponent
  ],
  exports: [
    ChartComponent,
    CommonModule,
    ChecklistComponent,
    DateRangeInputComponent,
    FormsModule,
    StepperComponent,
    ListItemComponent,
    DecodeHtmlStringPipe,
    NgxPopperjsModule,
    LoadingComponent,
    InlineSVGModule,
    NgSelectModule,
    TimeRangeSelectorComponent,
    ConfirmModalComponent,
    MetaDataSummaryComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    FormsModule,
    AngularMyDatePickerModule,
    NgxPopperjsModule,
    InlineSVGModule.forRoot(),
    NgSelectModule
  ],
  providers: [
    DecodeHtmlStringPipe
  ]
})
export class SharedModule {
}
