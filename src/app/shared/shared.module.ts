import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './components/chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { ChecklistComponent } from './components/checklist/checklist.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DateRangeInputComponent } from './components/date-range-input/date-range-input.component';
import { FormsModule } from '@angular/forms';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';


@NgModule({
  declarations: [
    ChartComponent,
    ChecklistComponent,
    CheckboxComponent,
    DateRangeInputComponent
  ],
  exports: [
    ChartComponent,
    CommonModule,
    ChecklistComponent,
    DateRangeInputComponent,
    FormsModule
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    FormsModule,
    AngularMyDatePickerModule
  ]
})
export class SharedModule {
}
