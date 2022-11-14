import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { ConfirmModal } from '@shr/models/confirm-modal.model';

@Component({
  selector: 'aqc-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent extends SimpleModalComponent<ConfirmModal, boolean> implements ConfirmModal {
  title: string;
  message: string;
  constructor() {
    super();
  }
  confirm() {
    this.result = true;
    this.close();
  }
}
