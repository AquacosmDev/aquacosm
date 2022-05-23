import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  public format(date: Date, formatString = 'HH:mm'): string {
    return moment(date).format(formatString);
  }
}
