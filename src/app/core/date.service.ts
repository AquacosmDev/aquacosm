import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { DateRange } from '@shr//models/date-range.model';
import { LastUploadTimeService } from '@core/collections/last-upload-time.service';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor(private lastUploadTimeService: LastUploadTimeService) { }

  public format(date: Date, formatString = 'HH:mm'): string {
    return moment(date).format(formatString);
  }

  public createWeekDateRange(): Observable<DateRange> {
    return this.getTimeOfLastTimePointWithData()
      .pipe(map(date => {
        return {
          start: moment(date).add(-1, 'week').startOf('day').toDate(),
          end: date
        }
      }));
  }

  public createDayDateRange(): Observable<DateRange> {
    return this.getTimeOfLastTimePointWithData()
      .pipe(map(date => {
        return {
          start: moment(date).add(-1, 'day').toDate(),
          end: date
        }
      }));
  }

  public createHourDateRange(): Observable<DateRange> {
    return this.getTimeOfLastTimePointWithData()
      .pipe(map(date => {
        return {
          start: moment(date).add(-1, 'hour').toDate(),
          end: date
        }
      }));
  }

  public createMonthDateRange(): Observable<DateRange> {
    return this.getTimeOfLastTimePointWithData()
      .pipe(map(date => {
        return {
          start: moment(date).add(-1, 'month').startOf('day').toDate(),
          end: date
        }
      }));
  }

  public isNewMonth(date: Date): boolean {
    const previousMinute = moment(date).add(-1, 'minute');
    return !moment(date).isSame(previousMinute, 'month');
  }

  public isNewDay(date: Date): boolean {
    const previousMinute = moment(date).add(-1, 'minute');
    return !moment(date).isSame(previousMinute, 'day');
  }

  public isNewHour(date: Date): boolean {
    const previousMinute = moment(date).add(-1, 'minute');
    return !moment(date).isSame(previousMinute, 'hour');
  }

  public isSame(date: Date, comparedDate: Date): boolean {
    return moment(date).isSame(comparedDate, 'minute');
  }

  public isDateRangeSame(dateRange: DateRange, comparedDateRange: DateRange): boolean {
    return this.isSame(dateRange.start, comparedDateRange.start) && this.isSame(dateRange.end, comparedDateRange.end);
  }

  public isSameOrAfter(date: Date, comparedDate: Date): boolean {
    return moment(date).isSameOrAfter(comparedDate, 'minute');
  }

  public isSameHour(date: Date, comparedDate: Date): boolean {
    return moment(date).isSame(comparedDate, 'hour');
  }

  public addHours(date: Date, hours: number): Date {
    return moment(date).add(hours, 'hours').toDate();
  }

  public addMinutes(date: Date, minutes: number): Date {
    return moment(date).add(minutes, 'minutes').toDate();
  }

  public isOnTheHour(date: Date): boolean {
    return moment(date).format('mm') === '00';
  }

  public getDayArrayFromDateRange(dateRange: DateRange): number[] {
    const start = moment(dateRange.start);
    const end = moment(dateRange.end);
    const days = [];
    while (!start.isAfter(end, 'day')) {
      days.push(this.dateToDay(start.toDate()));
      start.add(1, 'day');
    }
    return days;
  }

  public dateToDay(date: Date): number {
    return parseInt(moment(date).format('YYYYMMDD'), 0);
  }

  public getTimePointsForDay(day: number): Date[] {
    let startDate = moment(day, 'YYYYMMDD').startOf('day');
    const end = moment(day, 'YYYYMMDD').endOf('day').toDate();
    const dates = [];
    while (startDate.isSameOrBefore(this.getEndTimeForNow(end))) {
      dates.push(startDate.toDate());
      startDate = startDate.add(1, 'minute');
    }

    return dates;
  }

  public getTimePointsForDateRange(dateRange: DateRange): Date[] {
    const difference = this.getDifferenceInMinutes(dateRange);
    const dates = [];
    if (difference < 180) {
      let startDate = moment(dateRange.start);
      while (startDate.isSameOrBefore(this.getEndTimeForNow(dateRange.end))) {
        dates.push(startDate.toDate());
        startDate = startDate.add(1, 'minute');
      }
    } else {
      let startDate = moment(dateRange.start).set('minute', 0);
      while (startDate.isSameOrBefore(this.getEndTimeForNow(dateRange.end))) {
        dates.push(startDate.toDate());
        startDate = startDate.add(1, 'hour');
      }
    }
    return dates;
  }

  public getDifferenceInMinutes(dateRange: DateRange): number {
    return moment(dateRange.end).diff(dateRange.start, 'minutes');
  }

  public isInRange(date: Date, dateRange: DateRange): boolean {
    return moment(date).isSameOrAfter(dateRange.start) && moment(date).isSameOrBefore(dateRange.end);
  }

  public getEndTimeForNow(end: Date): Date {
    const endMoment = moment(end);
    if (endMoment.isSame(new Date(), 'minutes')) {
      while (endMoment.minute() % 5 != 0) {
        endMoment.add(-1, 'minutes');
      }
      return endMoment.toDate();
    } else {
      return end;
    }
  }

  public getTimeOfLastTimePointWithData(): Observable<Date> {
    return this.lastUploadTimeService.getLastUploadDate()
      .pipe(
        take(1),
        map(date => moment(date).toDate()));
  }
}
