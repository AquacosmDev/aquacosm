import { Component, OnDestroy, OnInit } from '@angular/core';
import { Partner } from '@shr//models/partner-model';
import { PartnerService } from '@core/collections/partner.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, ReplaySubject, switchMap, take, takeUntil, tap } from 'rxjs';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { Mesocosm } from '@shr//models/mesocosm.model';
import { ChecklistItem } from '@shr//models/checklist-item.model';
import { VariableService } from '@core/collections/variable.service';
import { Variable } from '@shr//models/variable.model';
import { DateRange } from '@shr//models/date-range.model';
import { IsSelectedService } from '@core/is-selected.service';
import { DataType } from '@shr/models/data-type.enum';
import { SimpleModalService } from 'ngx-simple-modal';
import { DownloadDataModalComponent } from '@ptn/partner/download-data-modal/download-data-modal.component';
import { DeviceService } from '@core/device.service';
import { DateService } from '@core/date.service';
import { LastUploadTimeService } from '@core/collections/last-upload-time.service';

@Component({
  selector: 'aqc-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss']
})
export class PartnerDetailComponent implements OnInit, OnDestroy {

  public partner!: Partner;
  public mesocosms!: ChecklistItem<Mesocosm>[];
  public variables!: ChecklistItem<Variable>[];
  public dateRanges!: ChecklistItem<{ name: string }>[];
  public dataType!: ChecklistItem<{ name: DataType }>[];

  public selectedVariables!: string[];
  public selectedVariable!: string;

  public selectedMesocosm!: string;

  public selectedDateRange!: string;

  public isMobile = false;
  public menu = false;
  public lastUpload!: Date;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private partnerService: PartnerService, private route: ActivatedRoute,
              private mesocosmService: MesocosmService, private variableService: VariableService,
              private isSelectedService: IsSelectedService, private simpleModalService: SimpleModalService,
              private deviceService: DeviceService, private dateService: DateService,
              private lastUploadTimeService: LastUploadTimeService) {
  }

  ngOnInit(): void {
    this.initComponent();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public setMesocosms(mesocosms: Mesocosm[]) {
    this.isSelectedService.setMesocosms(mesocosms.map(mesocosm => mesocosm.id));
  }

  public setMesocosm(mesocosm: string) {
    this.isSelectedService.setMesocosms([ mesocosm ]);
  }

  public setVariables(variables: Variable[]) {
    this.selectedVariables = variables.map(variable => variable.id);
    this.isSelectedService.setVariables(this.selectedVariables);
  }

  public setVariable(variableId: string) {
    this.selectedVariables = null;
    this.selectedVariables = [ variableId ];
    this.isSelectedService.setVariables(this.selectedVariables);
  }

  public setDateRange(dateRange: DateRange) {
    this.isSelectedService.setDateRange(dateRange);
  }

  public setDataType(dataType: { name: DataType }) {
    this.isSelectedService.setDataType(dataType.name);
  }

  public setDateRangeMobile(selectedItem: string) {
    let dateRange;
    if (selectedItem === 'week') {
      dateRange = this.dateService.createWeekDateRange();
    } else if (selectedItem === 'day') {
      dateRange = this.dateService.createDayDateRange();
    } else if (selectedItem === 'hour') {
      dateRange = this.dateService.createHourDateRange();
    }
    dateRange.subscribe(dateRange =>  this.isSelectedService.setDateRange(dateRange));
  }

  public downloadData() {
    this.simpleModalService.addModal(DownloadDataModalComponent, {
      partner: this.partner,
      mesocosms: this.mesocosms,
      variables: this.variables
    });
  }

  public toggleMenu() {
    this.menu = !this.menu;
  }

  private initComponent() {
    this.getIsMobile();
    this.createDataRangeCheckListItems();
    this.createDataTypeCheckListItems();
    this.getPartner()
      .subscribe(partner => {
        this.partner = partner;
        this.getMesocosms();
        this.getVariables();
        this.getUploadDate();
      });
  }

  private getMesocosms() {
    this.mesocosmService.getMesocosmsByPartnerIdSortedByName(this.partner.id!)
      .pipe(
        take(1),
        switchMap(mesocosms => this.convertMesocomsToChecklistItem(mesocosms)),
        tap(mesocosms => this.mesocosms = mesocosms),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)))
      .subscribe(mesocosms => {
        if (this.isMobile) {
          this.selectedMesocosm = mesocosms[ 0 ].id;
          this.isSelectedService.setMesocosms([ mesocosms[0].id ], true);
        } else {
          this.isSelectedService.setMesocosms(mesocosms.map(mesocosm => mesocosm.id), true);
        }
      });
  }

  private getVariables() {
    this.variableService.getVariableByPartnerId(this.partner.id!)
      .pipe(
        take(1),
        switchMap(variables => this.convertVariablesToChecklistItem(variables)),
        tap(variables => this.variables = variables),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)),
        tap(variables => this.isMobile ?
          this.isSelectedService.setVariables([ variables[ 0 ].id ], true) :
          this.isSelectedService.setVariables(variables.map(variable => variable.id), true)))
      .subscribe(selectedVariables => {
        this.selectedVariables = selectedVariables.map(variable => variable.id);
        this.selectedVariable = selectedVariables[ 0 ].id;
      });
  }

  private getPartner(): Observable<Partner> {
    return this.route.params
      .pipe(
        take(1),
        map(params => params['name']),
        switchMap(name => this.partnerService.getPartnerByName(name).pipe(take(1))))
  }

  private convertMesocomsToChecklistItem(items: Mesocosm[]): Observable<ChecklistItem<Mesocosm>[]> {
    return this.isSelectedService.getMesocosms()
      .pipe(take(1), map(selectedMesocosms => items.map(item => {
        return {checked: this.isSelected(item.id, selectedMesocosms), item: item}
      })))
  }

  private convertVariablesToChecklistItem(items: Variable[]): Observable<ChecklistItem<Variable>[]> {
    return this.isSelectedService.getVariables()
      .pipe(take(1), map(selectedVariables => items.map(item => {
        return {checked: this.isSelected(item.id, selectedVariables), item: item}
      })))
  }

  private isSelected(id: string, selectedIds: string[]): boolean {
    return selectedIds.length === 0 || selectedIds.includes(id);
  }

  private createDataTypeCheckListItems() {
    let storedDataType = localStorage.getItem('dataType');
    storedDataType = (!!storedDataType && storedDataType !== 'null') ? storedDataType : DataType.averaged;
    this.dataType = [
      {
        checked: storedDataType === DataType.raw,
        item: {
          name: DataType.raw
        }
      },
      {
        checked: storedDataType === DataType.averaged,
        item: {
          name: DataType.averaged
        }
      }
    ]
  }

  private createDataRangeCheckListItems() {
    let storedRangeName = localStorage.getItem('rangeName');
    storedRangeName = (!!storedRangeName && storedRangeName !== 'null' && ['day', 'week'].includes(storedRangeName)) ? storedRangeName : 'hour';
    this.selectedDateRange = storedRangeName;
    this.dateRanges = [
      {
        checked: storedRangeName === 'hour',
        item: {
          name: 'hour'
        }
      },
      {
        checked: storedRangeName === 'day',
        item: {
          name: 'day'
        }
      },
      {
        checked: storedRangeName === 'week',
        item: {
          name: 'week'
        }
      }
    ]
  }

  private getIsMobile() {
    this.deviceService.isMobile()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isMobile => this.isMobile = isMobile);
  }

  private getUploadDate() {
    this.lastUploadTimeService.getLastUploadDateByPartnerId(this.partner.id)
      .subscribe(date => this.lastUpload = date);
  }
}
