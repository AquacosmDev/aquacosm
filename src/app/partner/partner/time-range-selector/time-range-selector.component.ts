import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChecklistItem } from '@shr//models/checklist-item.model';
import { DateRange } from '@shr//models/date-range.model';
import { DateService } from '@core/date.service';

@Component({
  selector: 'aqc-time-range-selector',
  templateUrl: './time-range-selector.component.html',
  styleUrls: ['./time-range-selector.component.scss']
})
export class TimeRangeSelectorComponent implements OnInit {

  public checkListItems!: ChecklistItem<{ name: string }>[];
  public selectedItem!: string;

  public customDateRange!: DateRange;
  public closeCustomDateRange = true;

  @Output() dateRange = new EventEmitter<DateRange>();

  constructor(private dateService: DateService) { }

  ngOnInit(): void {
    this.createCheckListItems();
  }

  public setSelectedItem(selectedItem: { name: string }) {
    this.selectedItem = selectedItem.name;
    localStorage.setItem('rangeName', selectedItem.name);
    if (this.selectedItem === 'month') {
      this.dateService.createMonthDateRange()
        .subscribe(dateRange => this.dateRange.emit(dateRange));
    } else if (this.selectedItem === 'week') {
      this.dateService.createWeekDateRange()
        .subscribe(dateRange => this.dateRange.emit(dateRange));
    } else if (this.selectedItem === 'day') {
      this.dateService.createDayDateRange()
        .subscribe(dateRange => this.dateRange.emit(dateRange));
    } else if (this.selectedItem === 'hour') {
      this.dateService.createHourDateRange()
        .subscribe(dateRange => this.dateRange.emit(dateRange));
    } else {
      this.closeCustomDateRange = false;
    }
  }

  public setCustomDateRange(dateRange: DateRange) {
    this.customDateRange = dateRange;
    this.closeCustomDateRange = true;
    this.dateRange.emit(dateRange);
  }

  public openCustomDateRangeSelector() {
    this.closeCustomDateRange = false;
  }

  private createCheckListItems() {
    let dateRange = localStorage.getItem('rangeName');
    dateRange = (!!dateRange && dateRange !== 'null') ? dateRange : 'hour';
    this.checkListItems = [
      {
        checked: dateRange === 'hour',
        item: {
          name:'hour'
        }
      },
      {
        checked: dateRange === 'day',
        item: {
          name:'day'
        }
      },
      {
        checked: dateRange === 'week',
        item: {
          name:'week'
        }
      },
      {
        checked: dateRange === 'month',
        item: {
          name:'month'
        }
      },
      {
        checked: dateRange === 'custom',
        item: {
          name:'custom'
        }
      },
    ];
    this.setSelectedItem({name: dateRange});
    if(dateRange === 'custom') {
      this.setCustomDateRange(JSON.parse(localStorage.getItem('dateRange')));
    }
  }

}
