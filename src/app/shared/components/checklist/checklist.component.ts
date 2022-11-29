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

  public allSelected = false;

  private buttonClicked = new Subject<string>();

  constructor() {

  }

  ngOnInit() {
    this.isAllSelected();
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
    if(this.allSelected) {
      this.checklistItems.forEach(item => item.checked = false);
      this.selectedItems.emit([]);
      this.isAllSelected();
    } else {
      this.checklistItems.forEach(item => item.checked = true);
      this.selectedItems.emit(this.checklistItems.map(item => item.item));
      this.isAllSelected();
    }
  }

  private emitSelectedItems(selectedItem?: any) {
    if (this.multiselect) {
      this.selectedItems.emit(this.checklistItems.filter(item => item.checked).map(item => item.item));
      this.isAllSelected();
    } else {
      this.checklistItems.filter(item => item.item !== selectedItem.item).forEach(item => item.checked = false);
      this.selectedItems.emit(selectedItem.item);
    }
  }

  private isAllSelected() {
    this.allSelected = this.checklistItems.filter(item => item.checked).length === this.checklistItems.length;
  }
}
