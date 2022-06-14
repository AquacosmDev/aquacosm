import { Component, EventEmitter, HostBinding, OnInit, Output } from '@angular/core';
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
    if (this.selectedItem === 'month') {
      this.dateRange.emit(this.dateService.createMonthDateRange())
    } else if (this.selectedItem === 'week') {
      this.dateRange.emit(this.dateService.createWeekDateRange())
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
    this.checkListItems = [
      {
        checked: true,
        item: {
          name:'week'
        }
      },
      {
        checked: false,
        item: {
          name:'month'
        }
      },
      {
        checked: false,
        item: {
          name:'custom'
        }
      },
    ]
  }

}
