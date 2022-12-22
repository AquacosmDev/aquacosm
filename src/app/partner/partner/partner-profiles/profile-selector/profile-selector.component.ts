import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Profile } from '@shr/models/profile.model';
import { ChecklistItem } from '@shr/models/checklist-item.model';
import { DateService } from '@core/date.service';

@Component({
  selector: 'aqc-profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.scss']
})
export class ProfileSelectorComponent implements OnInit, OnChanges {
  @Input() profiles: Profile[];

  @Output() profile = new EventEmitter<Profile>();

  public checkListItems!: ChecklistItem<Profile>[];
  public selectProfiles!: ChecklistItem<Profile>[];
  public selectedProfile: ChecklistItem<Profile> = null;

  constructor(private dateService: DateService) { }

  ngOnInit(): void {
    this.getCheckListItems(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!!changes['profiles'] && !!changes['profiles'].previousValue && !!changes['profiles'].currentValue) {
      this.getCheckListItems();
    }
  }

  public selectCheckbox(checklistItem: ChecklistItem<Profile>) {
    const test = this.checkListItems.filter(item => item.item.id !== checklistItem.item.id);
    test.forEach(item => item.checked = false);
    this.selectedProfile = null;
    this.profile.emit(checklistItem.item);
  }

  public selectProfile(profile: Profile) {
    this.checkListItems.forEach(item => item.checked = false);
    this.profile.emit(profile);
  }

  private getCheckListItems(init = false) {
    this.selectProfiles = [ ...this.profiles ].map(profile => this.profileToCheckListItem(profile));
    let selectedProfile: ChecklistItem<Profile>;
    if(!!this.checkListItems) {
      selectedProfile = this.checkListItems.find(item => item.checked);
    }
    this.checkListItems = this.selectProfiles.splice(0, 3);
    if(init) {
      this.checkListItems[ 0 ].checked = true;
      this.selectCheckbox(this.checkListItems[ 0 ]);
    } else {
      this.checkListItems.find(item => item.item.id === selectedProfile.item.id).checked = true;
    }

  }

  private profileToCheckListItem(profile: Profile): ChecklistItem<Profile> {
    return {
      item: profile,
      checked: false,
      name: this.dateService.format(profile.startTime, 'yyyy-MM-DD HH:mm')
    }
  }

}
