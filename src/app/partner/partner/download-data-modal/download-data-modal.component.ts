import { Component, OnInit } from '@angular/core';
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Partner } from '@shr/models/partner-model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { ChecklistItem } from '@shr/models/checklist-item.model';
import { Variable } from '@shr/models/variable.model';
import { DateRange } from '@shr/models/date-range.model';
import { DownloadDataService } from '@ptn/partner/download-data.service';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'aqc-download-data-modal',
  templateUrl: './download-data-modal.component.html',
  styleUrls: ['./download-data-modal.component.scss'],
  providers: [ DownloadDataService ]
})
export class DownloadDataModalComponent extends SimpleModalComponent<{ }, any> implements OnInit {
  public NgxPopperjsTriggers = NgxPopperjsTriggers;
  public NgxPopperjsPlacements = NgxPopperjsPlacements;

  public disabled = true;

  public partner!: Partner;
  public mesocosms!: ChecklistItem<Mesocosm>[];
  public variables!: ChecklistItem<Variable>[];

  public selectedMesocosms!: Mesocosm[];
  public selectedVariables!: Variable[];
  public selectedVariablIds!: string[];
  public dateRange!: DateRange;

  public loading = false

  constructor(private downloadDataService: DownloadDataService) {
    super();
  }

  ngOnInit(): void {
    this.selectedMesocosms = this.mesocosms.filter(item => item.checked).map(item => item.item);
    this.selectedVariables = this.variables.filter(item => item.checked).map(item => item.item);
    this.selectedVariablIds = this.variables.filter(item => item.checked).map(item => item.item.id);
  }

  public setMesocosms(mesocosms: Mesocosm[]) {
    this.selectedMesocosms = mesocosms;
    this.isDisabled();
  }

  public setVariables(variables: Variable[]) {
    this.selectedVariables = variables;
    this.selectedVariablIds = variables.map(item => item.id);
    this.isDisabled();
  }

  public setCustomDateRange(dateRange: DateRange) {
    this.dateRange = dateRange;
    this.isDisabled();
  }

  public next() {
    this.loading = true;
    this.downloadDataService.downloadData(this.selectedVariables, this.selectedMesocosms, this.dateRange)
      .pipe(take(1),
        switchMap(data =>
          this.downloadDataService.downloadMetaDataForData(this.partner, this.dateRange, data)))
      .subscribe(data => {
        this.loading = false;
        this.downloadDataService.exportDataAsCsv(data, this.partner.name);
        this.close();
      });
  }

  public cancel() {
    this.close();
  }

  private isDisabled() {
    this.disabled = this.selectedMesocosms.length === 0 ||
      this.selectedVariables.length === 0 ||
      (!this.dateRange?.start || !this.dateRange?.end);
  }
}
