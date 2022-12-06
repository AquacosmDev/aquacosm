import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateRange } from '@app/shared/models/date-range.model';
import { IAngularMyDpOptions, IMyDate, IMyDateModel } from 'angular-mydatepicker';
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

  constructor(private dateService: DateService, private cdRef: ChangeDetectorRef) { }

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
      disableUntil: this.addDayToMyDate({ ...event.singleDate?.date }, 1)
    };
    if(this.disableSince) {
      this.endDpOptions.disableSince = this.disableSince;
    }
    if (this.date) {
      this.startDate = event;
      this.emitDateRange();
    }
    this.onHourChange(this.endHour, 'end', this.endDate && this.dateService.isSame(event.singleDate.jsDate, this.endDate.singleDate.jsDate, 'day'));
  }

  public endDateChanged(event: IMyDateModel): void {
    this.startDpOptions = {
      dateRange: false,
      dateFormat: 'yyyy-mm-dd',
      disableSince: this.addDayToMyDate({ ...event.singleDate?.date }, -1)
    };
    if (this.date) {
      this.endDate = event;
      this.emitDateRange();
    }
    this.onHourChange(this.startHour, 'start', this.startDate && this.dateService.isSame(this.startDate.singleDate.jsDate, event.singleDate.jsDate, 'day'));
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

  public onHourChange(value: number, moment: 'start' | 'end', forceCheck = false) {
    if (forceCheck || this.startDate && this.endDate && this.dateService.isSame(this.startDate.singleDate.jsDate, this.endDate.singleDate.jsDate, 'day')) {
      if (moment === 'start' && value > this.endHour) {
        this.changeHour(this.startHour, 'end');
      } else if (moment === 'end' && value < this.startHour) {
        this.changeHour(this.endHour, 'start');
      }
    }

    if (value > 23) {
      this.changeHour(23, moment);
    } else if (value < 0) {
      this.changeHour(0, moment);
    }
    if((forceCheck && moment !== 'start') || (!forceCheck && moment === 'start')) {
      this.onMinuteChange(this.endMinute, 'end', forceCheck);
    } else {
      this.onMinuteChange(this.startMinute, 'start', forceCheck);
    }
  }

  public onMinuteChange(value: number, moment: 'start' | 'end', forceCheck = false) {
    if (forceCheck || this.startDate && this.endDate && this.dateService.isSame(this.startDate.singleDate.jsDate, this.endDate.singleDate.jsDate, 'day') && this.startHour === this.endHour) {
      if (moment === 'start' && value > this.endMinute) {
        this.changeMinute(this.startMinute, 'end');
      } else if (moment === 'end' && value < this.startMinute) {
        this.changeMinute(this.endMinute, 'start');
      }
    }
    if (value > 59) {
      this.changeMinute(59, moment);
    }
    if (value < 0) {
      this.changeMinute(0, moment);
    }
  }

  private changeHour(value: number, moment: 'start' | 'end') {
    switch (moment) {
      case 'start': this.startHour = value; break;
      case 'end': this.endHour = value; break;
    }
  }

  private changeMinute(value: number, moment: 'start' | 'end') {
    switch (moment) {
      case 'start': this.startMinute = value; break;
      case 'end': this.endMinute = value; break;
    }
    this.cdRef.detectChanges();
  }

  private addDayToMyDate(date: IMyDate, days: number): IMyDate {
    date.day = date.day - days;
    return date;
  }
}
