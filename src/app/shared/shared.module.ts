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


@NgModule({
  declarations: [
    ChartComponent,
    ChecklistComponent,
    CheckboxComponent,
    DateRangeInputComponent,
    StepperComponent,
    ListItemComponent,
    DecodeHtmlStringPipe
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
    NgxPopperjsModule
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    FormsModule,
    AngularMyDatePickerModule,
    NgxPopperjsModule
  ]
})
export class SharedModule {
}
