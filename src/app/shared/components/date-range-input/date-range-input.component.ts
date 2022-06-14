import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DateRange } from '@app/shared/models/date-range.model';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';

@Component({
  selector: 'aqc-date-range-input',
  templateUrl: './date-range-input.component.html',
  styleUrls: ['./date-range-input.component.scss']
})
export class DateRangeInputComponent implements OnInit {

  public startDpOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'yyyy-mm-dd',
    disableSince: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() + 1 }
  };

  public endDpOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'yyyy-mm-dd',
    disableSince: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() + 1 }
  };

  public startDate!: IMyDateModel;
  public startHour!: number;
  public startMinute!: number;
  public endDate!: IMyDateModel;
  public endHour!: number;
  public endMinute!: number;

  @Output() customDateRange = new EventEmitter<DateRange>();

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  public startDateChanged(event: IMyDateModel): void {
    console.log(event);
    this.endDpOptions = {
      dateRange: false,
      dateFormat: 'yyyy-mm-dd',
      disableSince: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() + 1 },
      disableUntil: event.singleDate?.date
    };
    console.log(this.endDpOptions);
  }

  public endDateChanged(event: IMyDateModel): void {
    console.log(event);
  }

  public emitDateRange() {
    this.customDateRange.emit({
      start: new Date(
        this.startDate.singleDate?.date?.year!,
        this.startDate.singleDate?.date?.month! - 1,
        this.startDate.singleDate?.date?.day!,
        this.startHour || 0,
        this.startMinute || 0),
      end: new Date(
        this.endDate.singleDate?.date?.year!,
        this.endDate.singleDate?.date?.month! - 1,
        this.endDate.singleDate?.date?.day!,
        this.endHour || 23,
        this.endMinute || 59
      )
    })
  }
}
