import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { DateRange } from '@shr//models/date-range.model';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  public format(date: Date, formatString = 'HH:mm'): string {
    return moment(date).format(formatString);
  }

  public createWeekDateRange(): DateRange {
    return {
      start: moment().add(-1, 'week').startOf('day').toDate(),
      end: new Date()
    }
  }

  public createMonthDateRange(): DateRange {
    return {
      start: moment().add(-1, 'month').startOf('day').toDate(),
      end: new Date()
    }
  }

  public isNewDay(date: Date): boolean {
    const previousMinute = moment(date).add(-1, 'minute');
    return !moment(date).isSame(previousMinute, 'day');
  }

  public addHours(date: Date, hours: number): Date {
    return moment(date).add(hours, 'hours').toDate();
  }

  public isOnTheHour(date: Date): boolean {
    return moment(date).format('mm') === '00';
  }
}
