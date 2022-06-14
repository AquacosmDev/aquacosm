import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChecklistItem } from '@shr//models/checklist-item.model';

@Component({
  selector: 'aqc-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent {

  @Input() checklistItems!: ChecklistItem<any>[];
  @Input() row = false;
  @Input() iconClass!: string;
  @Input() multiselect = true;
  @Output() selectedItems = new EventEmitter<any[] | any>();

  constructor() { }

  public emitSelectedItems(selectedItem?: any) {
    if (this.multiselect) {
      this.selectedItems.emit(this.checklistItems.filter(item => item.checked).map(item => item.item));
    } else {
      this.checklistItems.filter(item => item.item !== selectedItem.item).forEach(item => item.checked = false);
      this.selectedItems.emit(selectedItem.item);
    }
  }
}
