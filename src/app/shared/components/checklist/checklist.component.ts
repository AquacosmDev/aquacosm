import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ChecklistItem } from '@shr//models/checklist-item.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'aqc-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit, OnDestroy {

  @Input() checklistItems!: ChecklistItem<any>[];
  @Input() row = false;
  @Input() iconClass!: string;
  @Input() multiselect = true;
  @Output() selectedItems = new EventEmitter<any[] | any>();

  private buttonClicked = new Subject<string>();

  constructor() {

  }

  ngOnInit() {
    this.buttonClicked.pipe(debounceTime(1000))
      .subscribe(selectedItem => this.emitSelectedItems(selectedItem));
  }

  ngOnDestroy() {
    this.buttonClicked.complete();
    this.buttonClicked = null;
  }

  public click(selectedItem?: any) {
    if(this.multiselect) {
      this.buttonClicked.next(selectedItem);
    } else {
      this.emitSelectedItems(selectedItem);
    }
  }

  public selectAll() {
    this.checklistItems.forEach(item => item.checked = true);
    this.selectedItems.emit(this.checklistItems.map(item => item.item));
  }

  private emitSelectedItems(selectedItem?: any) {
    if (this.multiselect) {
      this.selectedItems.emit(this.checklistItems.filter(item => item.checked).map(item => item.item));
    } else {
      this.checklistItems.filter(item => item.item !== selectedItem.item).forEach(item => item.checked = false);
      this.selectedItems.emit(selectedItem.item);
    }
  }
}
