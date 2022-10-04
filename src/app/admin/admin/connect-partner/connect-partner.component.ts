import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

@Component({
  selector: 'aqc-connect-partner',
  templateUrl: './connect-partner.component.html',
  styleUrls: ['./connect-partner.component.scss']
})
export class ConnectPartnerComponent extends SimpleModalComponent<{ }, any> implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
