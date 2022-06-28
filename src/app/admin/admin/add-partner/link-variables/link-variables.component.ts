import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Variable } from '@shr/models/variable.model';

@Component({
  selector: 'aqc-link-variables',
  templateUrl: './link-variables.component.html',
  styleUrls: ['./link-variables.component.scss']
})
export class LinkVariablesComponent implements OnInit {

  @Input() variables!: Variable[];
  @Input() dataMap = {} as { [variableName: string]: string };
  @Output() dataMapChange = new EventEmitter<{ [variableName: string]: string }>();


  constructor() { }

  ngOnInit(): void {
  }

  public changeVariableLink() {
    this.dataMapChange.emit(this.dataMap);
  }

}
