import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'aqc-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss']
})
export class PartnerDetailComponent implements OnInit {

  public partner!: Partner;
  public mesocosms!: ChecklistItem<Mesocosm>[];
  public variables!: ChecklistItem<Variable>[];

  public selectedVariables!: string[];

  constructor(private partnerService: PartnerService, private route: ActivatedRoute,
              private mesocosmService: MesocosmService, private variableService: VariableService,
              private isSelectedService: IsSelectedService) { }

  ngOnInit(): void {
    this.initComponent();
  }

  public setMesocosms(mesocosms: Mesocosm[]) {
    this.isSelectedService.setMesocosms(mesocosms);
  }

  public setVariables(variables: Variable[]) {
    this.selectedVariables = variables.map(variable => variable.id);
    this.isSelectedService.setVariables(variables);
  }

  public setDateRange(dateRange: DateRange) {
    this.isSelectedService.setDateRange(dateRange);
  }

  private initComponent() {
    this.getPartner()
      .subscribe(partner => {
        this.partner = partner;
        this.getMesocosms();
        this.getVariables();
      });
  }

  private getMesocosms() {
    this.mesocosmService.getMesocosmsByPartnerIdSortedByName(this.partner.id!)
      .pipe(
        take(1),
        switchMap(mesocosms => this.convertMesocomsToChecklistItem(mesocosms)),
        tap(mesocosms => this.mesocosms = mesocosms),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)))
      .subscribe(mesocosms => this.isSelectedService.setMesocosms(mesocosms, true));
  }

  private getVariables() {
    this.variableService.getVariableByPartnerId(this.partner.id!)
      .pipe(
        take(1),
        switchMap(variables => this.convertVariablesToChecklistItem(variables)),
        tap(variables => this.variables = variables),
        map(checklistItems => checklistItems.filter(item => item.checked).map(item => item.item)),
        tap(variables => this.isSelectedService.setVariables(variables, true)))
      .subscribe(selectedVariables => this.selectedVariables = selectedVariables.map(variable => variable.id));
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
      .pipe(take(1), map(selectedMesocosms => items.map(item => { return { checked: this.isSelected(item.id, selectedMesocosms), item: item }})))
  }

  private convertVariablesToChecklistItem(items: Variable[]): Observable<ChecklistItem<Variable>[]> {
    return this.isSelectedService.getVariables()
      .pipe(take(1), map(selectedVariables => items.map(item => { return { checked: this.isSelected(item.id, selectedVariables), item: item }})))
  }

  private isSelected(id: string, selectedIds: string[]): boolean {
    return selectedIds.length === 0 || selectedIds.includes(id);
  }
}
