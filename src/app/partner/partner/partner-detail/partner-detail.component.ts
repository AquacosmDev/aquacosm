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

@Component({
  selector: 'aqc-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss']
})
export class PartnerDetailComponent implements OnInit, OnDestroy {

  public partner!: Partner;
  public mesocosms!: ChecklistItem<Mesocosm>[];
  public variables!: ChecklistItem<Variable>[];

  public selectedMesocosms: Mesocosm[] | undefined;
  public selectedVariables: Variable[] | undefined;
  public dateRange!: DateRange;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private partnerService: PartnerService, private route: ActivatedRoute,
              private mesocosmService: MesocosmService, private variableService: VariableService) { }

  ngOnInit(): void {
    this.initComponent();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initComponent() {
    this.getPartner()
      .subscribe(partner => {
        this.partner = partner;
        this.destroyed$.next(true);
        this.destroyed$.complete();
        this.destroyed$ = new ReplaySubject(1);
        this.getMesocosms();
        this.getVariables();
      });
  }

  private getMesocosms() {
    console.log(this.partner.id);
    this.mesocosmService.getMesocosmByPartnerId(this.partner.id!)
      .pipe(
        takeUntil(this.destroyed$),
        map((mesocosms: Mesocosm[]) => {
          mesocosms.sort((a: Mesocosm, b: Mesocosm) => {
            if (a.name < b.name) {
              return -1;
            }
            if (b.name > a.name) {
              return 1;
            }
            return 0;
          });
          return mesocosms;
        }),
        tap(mesocosms => this.selectedMesocosms = mesocosms),
        map(mesocosms => this.convertToChecklistItem(mesocosms)))
      .subscribe(mesocosms => {
        console.log(mesocosms);
        this.mesocosms = mesocosms as ChecklistItem<Mesocosm>[]
      });
  }

  private getVariables() {
    this.variableService.getVariableByPartnerId(this.partner.id!)
      .pipe(
        takeUntil(this.destroyed$),
        tap(variables => this.selectedVariables = variables),
        map(variables => this.convertToChecklistItem(variables)))
      .subscribe(variables => this.variables = variables as ChecklistItem<Variable>[]);
  }

  private getPartner(): Observable<Partner> {
    return this.route.params
      .pipe(
        take(1),
        map(params => params['name']),
        switchMap(name => this.partnerService.getPartnerByName(name)))
  }

  private convertToChecklistItem(items: Mesocosm[] | Variable[]): ChecklistItem<Mesocosm | Variable>[] {
    return items.map(item => { return { checked: true, item: item }});
  }
}
