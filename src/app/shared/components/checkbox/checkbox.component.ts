import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChecklistItem } from '@shr//models/checklist-item.model';

@Component({
  selector: 'aqc-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {

  @Input() item!: ChecklistItem<any>;
  @Input() row = true;
  @Input() iconClass!: string;
  @Input() multiselect = true;
  @Input() reselect = false
  @Output() itemChange = new EventEmitter<ChecklistItem<any>>();

  constructor() { }

  public toggleItem() {
    if (this.multiselect || this.reselect || !this.item.checked) {
      if(!this.reselect) {
        this.item.checked = !this.item.checked;
      }
      this.itemChange.emit(this.item);
    }
  }

}
