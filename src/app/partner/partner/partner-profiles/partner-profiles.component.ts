import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Partner } from '@shr/models/partner-model';
import { ChecklistItem } from '@shr/models/checklist-item.model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { Variable } from '@shr/models/variable.model';
import { DataType } from '@shr/models/data-type.enum';
import { filter, map, Observable, ReplaySubject, switchMap, take, takeUntil, tap } from 'rxjs';
import { PartnerService } from '@core/collections/partner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { VariableService } from '@core/collections/variable.service';
import { IsSelectedService } from '@core/is-selected.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { DeviceService } from '@core/device.service';
import { DateService } from '@core/date.service';
import { LastUploadTimeService } from '@core/collections/last-upload-time.service';
import { DateRange } from '@shr/models/date-range.model';
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs';
import { ProfileService } from '@core/collections/profile.service';
import { Profile } from '@shr/models/profile.model';
import {
  DownloadProfileModalComponent
} from '@ptn/partner/partner-profiles/download-profile-modal/download-profile-modal.component';

@Component({
  selector: 'aqc-partner-profiles',
  templateUrl: './partner-profiles.component.html',
  styleUrls: ['./partner-profiles.component.scss']
})
export class PartnerProfilesComponent implements OnInit, OnDestroy {
  public NgxPopperjsTriggers = NgxPopperjsTriggers;
  public NgxPopperjsPlacements = NgxPopperjsPlacements;

  public partner!: Partner;
  public mesocosms!: ChecklistItem<Mesocosm>[];
  public variables!: ChecklistItem<Variable>[];
  public dateRanges!: ChecklistItem<{ name: string }>[];
  public dataType!: ChecklistItem<{ name: DataType }>[];
  public profiles!: Profile[];

  public selectedVariables!: string[];
  public selectedVariable!: string;
  public selectedDateRange!: string;
  public selectedProfile!: Profile;

  public isMobile = false;
  public menu = false;
  public lastUpload!: Date;
  public mesocosmsOpen = true;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private partnerService: PartnerService, private route: ActivatedRoute,
              private mesocosmService: MesocosmService, private variableService: VariableService,
              private isSelectedService: IsSelectedService, private simpleModalService: SimpleModalService,
              private deviceService: DeviceService, private dateService: DateService,
              private lastUploadTimeService: LastUploadTimeService, private router: Router,
              private profileService: ProfileService, private cdRef: ChangeDetectorRef) {
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

  public setVariables(variables: Variable[]) {
    this.selectedVariables = variables.map(variable => variable.id);
    this.isSelectedService.setVariables(this.selectedVariables);
  }

  public setVariable(variableId: string) {
    this.selectedVariables = null;
    this.selectedVariables = [variableId];
    this.isSelectedService.setVariables(this.selectedVariables);
  }

  public setDateRange(dateRange: DateRange) {
    this.isSelectedService.setDateRange(dateRange);
  }

  public setDataType(dataType: { name: DataType }) {
    this.isSelectedService.setDataType(dataType.name);
  }

  public setProfile(profile: Profile) {
    this.selectedProfile = profile;
    this.mesocosms.forEach(mesocosm => {
      mesocosm.disabled = !!this.selectedProfile.mesocosms && !this.selectedProfile.mesocosms.includes(mesocosm.item.id);
    });
    this.setMesocosms(this.mesocosms.filter(item => item.checked && !item.disabled).map(item => item.item));
    this.cdRef.detectChanges();
  }

  public setDateRangeMobile(selectedItem: string) {
    let dateRange;
    if (selectedItem === 'month') {
      dateRange = this.dateService.createMonthDateRange();
    } else if (selectedItem === 'week') {
      dateRange = this.dateService.createWeekDateRange();
    }
    dateRange.subscribe(dateRange => this.isSelectedService.setDateRange(dateRange));
  }

  public toggleMenu() {
    this.menu = !this.menu;
  }

  public backToDashboard() {
    this.router.navigate([ 'partner', this.partner.name ]);
  }

  public downloadData() {
    this.isSelectedService.getDateRange()
      .pipe(take(1))
      .subscribe(dateRange => {
        this.simpleModalService.addModal(DownloadProfileModalComponent, {
        partner: this.partner,
        dateRange: dateRange
      })
      })
  }

  private initComponent() {
    this.getIsMobile();
    this.getPartner()
      .subscribe(partner => {
        this.partner = partner;
        this.getMesocosms();
        this.getVariables();
        this.getProfiles();
      });
  }

  private getMesocosms() {
    this.mesocosmService.getMesocosmsByPartnerIdSortedByName(this.partner.id!)
      .pipe(
        take(1),
        switchMap(mesocosms => this.convertMesocomsToChecklistItem(mesocosms)),
        tap(mesocosms => this.mesocosms = mesocosms),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)))
      .subscribe(mesocosms => this.isSelectedService.setMesocosms(mesocosms.map(mesocosm => mesocosm.id), true));
  }

  private getVariables() {
    this.variableService.getVariableByPartnerId(this.partner.id!)
      .pipe(
        take(1),
        switchMap(variables => this.convertVariablesToChecklistItem(variables)),
        tap(variables => this.variables = variables),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)),
        tap(variables => this.isMobile ?
          this.isSelectedService.setVariables([variables[0].id], true) :
          this.isSelectedService.setVariables(variables.map(variable => variable.id), true)))
      .subscribe(selectedVariables => {
        this.selectedVariables = selectedVariables.map(variable => variable.id);
        this.selectedVariable = !!selectedVariables[0] ? selectedVariables[0].id : null;
      });
  }

  private getPartner(): Observable<Partner> {
    return this.route.params
      .pipe(
        take(1),
        map(params => params['name']),
        switchMap(name => this.partnerService.getPartnerByName(name).pipe(take(1))))
  }

  private getProfiles() {
    this.isSelectedService.getDateRange()
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(dateRange => this.profileService.getProfilesByPartnerAndDate(this.partner.id, dateRange)),
        filter(profiles => !!profiles && profiles.length > 0))
      .subscribe(profiles => {
        this.profiles = profiles;
        if (this.isMobile && !this.selectedProfile) {
          this.selectedProfile = this.profiles[ 0 ];
        }
      });
  }

  private convertMesocomsToChecklistItem(items: Mesocosm[]): Observable<ChecklistItem<Mesocosm>[]> {
    return this.isSelectedService.getMesocosms()
      .pipe(take(1), map(selectedMesocosms => items.map(item => {
        return {checked: this.isSelected(item.id, selectedMesocosms), item: item, disabled: !!this.selectedProfile && !!this.selectedProfile.mesocosms && !this.selectedProfile.mesocosms.includes(item.id)}
      })))
  }

  private convertVariablesToChecklistItem(items: Variable[]): Observable<ChecklistItem<Variable>[]> {
    return this.isSelectedService.getVariables()
      .pipe(take(1), map(selectedVariables => items.map(item => {
        return {checked: this.isSelected(item.id, selectedVariables), item: item}
      })))
  }

  private isSelected(id: string, selectedIds: string[]): boolean {
    return selectedIds.includes(id);
  }

  private createDataRangeCheckListItems() {
    this.selectedDateRange = 'week';
    this.dateRanges = [
      {
        checked: true,
        item: {
          name: 'week'
        }
      },
      {
        checked: false,
        item: {
          name: 'month'
        }
      }
    ]

    if (!this.isMobile) {
      this.dateRanges.push({
          checked: false,
          item: {
            name:'custom'
          },
          reselect: true
        });
    } else {
      this.setDateRangeMobile('week');
    }

  }

  private getIsMobile() {
    this.deviceService.isMobile()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        this.createDataRangeCheckListItems();
      });
  }
}
