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
}
