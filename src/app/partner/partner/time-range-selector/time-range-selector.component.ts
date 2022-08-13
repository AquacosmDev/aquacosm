import { Component, EventEmitter, HostBinding, OnInit, Output } from '@angular/core';
import { ChecklistItem } from '@shr//models/checklist-item.model';
import { DateRange } from '@shr//models/date-range.model';
import { DateService } from '@core/date.service';
import { IsSelectedService } from '@core/is-selected.service';

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
      this.dateRange.emit(this.dateService.createMonthDateRange())
    } else if (this.selectedItem === 'week') {
      this.dateRange.emit(this.dateService.createWeekDateRange())
    } else if (this.selectedItem === 'day') {
      this.dateRange.emit(this.dateService.createDayDateRange())
    } else if (this.selectedItem === 'hour') {
      this.dateRange.emit(this.dateService.createHourDateRange())
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
    dateRange = dateRange !== 'null' ? dateRange : 'hour';
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
