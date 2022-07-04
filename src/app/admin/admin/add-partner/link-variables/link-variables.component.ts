import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Variable } from '@shr/models/variable.model';

@Component({
  selector: 'aqc-link-variables',
  templateUrl: './link-variables.component.html',
  styleUrls: ['./link-variables.component.scss']
})
export class LinkVariablesComponent implements OnInit, OnChanges {

  @Input() variables!: Variable[];
  @Input() dataMap = {} as { [variableName: string]: string };
  @Output() dataMapChange = new EventEmitter<{ [variableName: string]: string }>();


  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log(this.dataMap, this.variables);
    this.cdRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);

  }

  public changeVariableLink() {
    Object.keys(this.dataMap).forEach(key => {
      if (!this.dataMap[ key ]) {
        this.dataMap[ key ] = '';
      }
    });
    this.dataMapChange.emit(this.dataMap);
  }

}
