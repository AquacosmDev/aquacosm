import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateRange } from '@app/shared/models/date-range.model';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import { DateService } from '@core/date.service';

@Component({
  selector: 'aqc-date-range-input',
  templateUrl: './date-range-input.component.html',
  styleUrls: ['./date-range-input.component.scss']
})
export class DateRangeInputComponent implements OnInit {
  @Input() column = false;
  @Input() date = false;
  @Input() dateRange!: DateRange;
  @Input() disableSince = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() + 1 };

  public startDpOptions: IAngularMyDpOptions = {
    appendSelectorToBody: true,
    dateRange: false,
    dateFormat: 'yyyy-mm-dd'
  };

  public endDpOptions: IAngularMyDpOptions = {
    appendSelectorToBody: true,
    dateRange: false,
    dateFormat: 'yyyy-mm-dd'
  };

  public startDate!: IMyDateModel;
  public startHour!: number;
  public startMinute!: number;
  public endDate!: IMyDateModel;
  public endHour!: number;
  public endMinute!: number;

  @Output() dateRangeChange = new EventEmitter<DateRange>();

  constructor(private dateService: DateService) { }

  ngOnInit(): void {
    if(this.disableSince) {
      this.startDpOptions.disableSince = this.disableSince;
      this.endDpOptions.disableSince = this.disableSince;
    }
    if (this.dateRange) {
      this.startDate = {
        isRange: false,
        singleDate: {
          jsDate: this.dateRange.start,
          formatted: this.dateService.format(this.dateRange.start, 'yyyy-MM-DD')
        }
      };
      if (!!this.dateRange.end) {
        this.endDate = {
          isRange: false,
          singleDate: {
            jsDate: this.dateRange.end,
            formatted: this.dateService.format(this.dateRange.end, 'yyyy-MM-DD')
          }
        };
      }
    }
    if (this.date && !this.dateRange && this.disableSince) {
      this.endDate = {isRange: false, singleDate: {jsDate: new Date(), formatted: 'now'}};
    }
  }

  public startDateChanged(event: IMyDateModel): void {
    this.endDpOptions = {
      dateRange: false,
      dateFormat: 'yyyy-mm-dd',
      disableUntil: event.singleDate?.date
    };
    if(this.disableSince) {
      this.endDpOptions.disableSince = this.disableSince;
    }
    if (this.date) {
      this.startDate = event;
      this.emitDateRange();
    }
  }

  public endDateChanged(event: IMyDateModel): void {
    this.startDpOptions = {
      dateRange: false,
      dateFormat: 'yyyy-mm-dd',
      disableSince: event.singleDate?.date
    };
    if (this.date) {
      this.endDate = event;
      this.emitDateRange();
    }
  }

  public emitDateRange() {
    this.dateRangeChange.emit({
      start: !!this.startDate ? new Date(
        this.startDate.singleDate?.date?.year!,
        this.startDate.singleDate?.date?.month! - 1,
        this.startDate.singleDate?.date?.day!,
        this.startHour || 0,
        this.startMinute || 0) : null,
      end: !!this.endDate ? !!this.endDate.singleDate!.date ? new Date(
        this.endDate.singleDate?.date?.year!,
        this.endDate.singleDate?.date?.month! - 1,
        this.endDate.singleDate?.date?.day!,
        this.endHour || 23,
        this.endMinute || 59) : this.endDate.singleDate.jsDate : null
    })
  }
}
