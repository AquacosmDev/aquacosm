import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'aqc-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Output() search = new EventEmitter<string>();

  public searchValue: string;

  constructor() { }

  public onChange() {
    this.search.emit(this.searchValue);
  }
}
