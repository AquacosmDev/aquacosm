import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Variable } from '@shr/models/variable.model';
import { Mesocosm } from '@shr/models/mesocosm.model';

@Component({
  selector: 'aqc-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {

  @Input() listItem!: Variable | Mesocosm;
  @Output() editItem = new EventEmitter<Variable | Mesocosm>();
  @Output() deleteItem = new EventEmitter<Variable | Mesocosm>();

  constructor() { }

  ngOnInit(): void {
  }

  public edit() {
    this.editItem.emit(this.listItem);
  }

  public delete() {
    this.deleteItem.emit(this.listItem);
  }

}
