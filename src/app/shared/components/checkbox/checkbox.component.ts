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
  @Output() itemChange = new EventEmitter<ChecklistItem<any>>();

  constructor() { }

  public toggleItem() {
    console.log(this.multiselect, this.item.checked);
    if (this.multiselect || !this.item.checked) {
      this.item.checked = !this.item.checked;
      this.itemChange.emit(this.item);
    }
  }

}
