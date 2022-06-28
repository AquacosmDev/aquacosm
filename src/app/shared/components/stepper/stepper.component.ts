import { Component, Input, OnInit } from '@angular/core';
import { Step } from '@shr/models/step.modal';

@Component({
  selector: 'aqc-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  @Input() steps!: Step;
  @Input() selectedStep = 1;
  public stepArray!: number[];

  constructor() { }

  ngOnInit(): void {
    this.stepArray = Object.keys(this.steps).map(step => +step);
  }

}
