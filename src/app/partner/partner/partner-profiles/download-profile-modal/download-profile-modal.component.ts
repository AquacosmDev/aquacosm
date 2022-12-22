import { Component, OnInit } from '@angular/core';
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { DateRange } from '@shr/models/date-range.model';
import { map, switchMap, take } from 'rxjs';
import { DownloadDataService } from '@ptn/partner/download-data.service';
import { Partner } from '@shr/models/partner-model';
import { ChecklistItem } from '@shr/models/checklist-item.model';
import { ProfileService } from '@core/collections/profile.service';
import { Profile } from '@shr/models/profile.model';
import { DateService } from '@core/date.service';
import { ProfileChartService } from '@ptn/partner/partner-profiles/profile-chart.service';

@Component({
  selector: 'aqc-download-profile-modal',
  templateUrl: './download-profile-modal.component.html',
  styleUrls: ['./download-profile-modal.component.scss'],
  providers: [ DownloadDataService, ProfileChartService ]
})
export class DownloadProfileModalComponent extends SimpleModalComponent<{ }, any> implements OnInit {
  public NgxPopperjsTriggers = NgxPopperjsTriggers;
  public NgxPopperjsPlacements = NgxPopperjsPlacements;

  public disabled = true;

  public partner!: Partner;
  public dateRange!: DateRange;
  public profiles: ChecklistItem<Profile>[];
  public selectedProfiles: Profile[] = [];

  public loading = false

  constructor(private downloadDataService: DownloadDataService, private profileService: ProfileService,
              private dateService: DateService, private profileChartService: ProfileChartService) {
    super();
  }

  ngOnInit(): void {
    this.getProfiles();
  }

  public setCustomDateRange(dateRange: DateRange) {
    this.dateRange = dateRange;
    this.getProfiles();
    this.isDisabled();
  }

  public setMesocosms(profiles: Profile[]) {
    this.selectedProfiles = profiles;
    this.isDisabled();
  }

  public next() {
    this.loading = true;
    this.profileChartService.getProfileChartDataForAllOptions(this.selectedProfiles)
      .pipe(
        take(1),
        map(chartData => this.downloadDataService.profileChartDataToCsvObject(chartData)),
        switchMap(csvData => this.downloadDataService.downloadMetaDataForData(this.partner, this.dateRange,  csvData))
        )
      .subscribe(data => {
        this.loading = false;
        this.downloadDataService.exportDataAsCsv(data, this.partner.name, 'profiles');
        this.close();
      });
  }

  public cancel() {
    this.close();
  }

  private isDisabled() {
    this.disabled = this.selectedProfiles.length === 0;
  }

  private getProfiles() {
    this.profileService.getProfilesByPartnerAndDate(this.partner.id, this.dateRange)
      .pipe(
        take(1),
        map(profiles => profiles.map(profile => this.profileToChecklistItem(profile))))
      .subscribe(profiles => {
        this.profiles = profiles;
        this.selectedProfiles = this.profiles.map(item => item.item);
        this.isDisabled();
      })
  }

  private profileToChecklistItem(profile: Profile): ChecklistItem<Profile> {
    return {
      item: profile,
      checked: true,
      name: this.dateService.format(profile.startTime, 'yyyy-MM-DD HH:mm')
    }
  }

}
