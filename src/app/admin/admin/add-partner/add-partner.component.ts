import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Partner } from '@shr/models/partner-model';
import { Variable } from '@shr/models/variable.model';
import { Mesocosm } from '@shr/models/mesocosm.model';
import { PartnerService } from '@core/collections/partner.service';
import { Observable, combineLatest, switchMap, map, take, of } from 'rxjs';
import { VariableService } from '@core/collections/variable.service';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs';

@Component({
  selector: 'aqc-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerComponent extends SimpleModalComponent<{ }, any> implements OnInit {
  public NgxPopperjsTriggers = NgxPopperjsTriggers;
  public NgxPopperjsPlacements = NgxPopperjsPlacements;

  public partner!: Partner;
  public isNew = false;

  public selectedStep = 1;
  public steps = {
    1: 'Partner',
    2: 'Variables',
    3: 'Mesocosms'
  }

  public urlError = false;

  public editing = false;

  public variable: Variable = {} as Variable;
  public variables: Variable[] = [];
  private deletedVariables: Variable[] = [];

  public mesocosm: Mesocosm = { dataMapping: {} } as Mesocosm;
  public mesocosms: Mesocosm[] = [];
  private deletedMesocosms: Mesocosm[] = [];

  constructor(private partnerService: PartnerService, private variableService: VariableService,
              private mesocosmService: MesocosmService) {
    super();
  }

  ngOnInit(): void {
    if (!this.partner) {
      this.partner = {} as Partner;
      this.isNew = true
    } else {
      this.variableService.getVariableByPartnerId(this.partner.id!)
        .pipe(take(1))
        .subscribe(variables => this.variables = variables);

      this.mesocosmService.getMesocosmsByPartnerIdSortedByName(this.partner.id!)
        .pipe(take(1))
        .subscribe(mesocosms => this.mesocosms = mesocosms);
    }
  }

  public next() {
    this.selectedStep++;
    if (this.selectedStep === 2) {
      this.variable = {} as Variable;
    } else if (this.selectedStep === 3) {
      this.mesocosm = { dataMapping: {} } as Mesocosm;
    } else if (this.selectedStep === 4) {
      this.savePartnerAndVariables();
    }
  }

  public previous() {
    this.selectedStep--;
    if (this.selectedStep === 2) {
      this.variable = {} as Variable;
    }
  }

  public isNextDisabled() {
    return !!this.partner ?
      this.selectedStep === 1 ?
        ((this.partner.displayName?.length || 0) === 0 && (this.partner.logo?.length || 0) === 0) :
        this.selectedStep === 2 ? !this.variables || this.variables.length === 0 :
          this.selectedStep === 3 ? !this.mesocosms || this.mesocosms.length === 0  : true
      : false;
  }

  public validURL() {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    this.urlError = !pattern.test(this.partner.logo);
  }

  public addVariable() {
    if(!this.editing) {
      this.variables.push(this.variable);
    }
    this.variable = {} as Variable;
    this.editing = false;
  }

  public deleteVariable(variable: Variable | Mesocosm) {
    this.deletedVariables.push(variable as Variable);
    this.variables = this.removeFromList<Variable>(this.variables, variable as Variable);
  }

  public editVariable(variable: Variable | Mesocosm) {
    this.editing = true;
    this.variable = variable as Variable;
  }

  public addMesocosm() {
    if(!this.editing) {
      this.mesocosms.push(this.mesocosm);
    }
    this.mesocosm = { dataMapping: {} } as Mesocosm;
    this.editing = false;
  }

  public deleteMesocosm(mesocosm: Variable | Mesocosm) {
    this.deletedMesocosms.push(mesocosm as Mesocosm);
    this.mesocosms = this.removeFromList<Mesocosm>(this.mesocosms, mesocosm as Mesocosm);
    this.mesocosm = { dataMapping: {} } as Mesocosm;
  }

  public editMesocosm(mesocosm: Variable | Mesocosm) {
    this.editing = true;
    this.mesocosm = mesocosm as Mesocosm;
  }

  private removeFromList<T>(list: T[], item: T): T[] {
    const index = list.indexOf(item, 0);
    if (index > -1) {
      list.splice(index, 1);
    }
    return list;
  }

  private savePartnerAndVariables() {
    this.savePartner()
      .pipe(
        switchMap(partner => this.deleteVariables(partner)),
        switchMap(partner => this.saveVariables(partner)),
        switchMap(result => this.saveMesocosms(result)),
        switchMap(() => this.deleteMesocosms()))
      .subscribe(() => this.close());
  }

  private saveMesocosms(result: { variables: Variable[], partner: Partner }): Observable<Mesocosm[]> {
    this.mesocosms.forEach(mesocosm => {
      mesocosm.partnerId = result.partner.id!
      result.variables
        .filter(variable => !!mesocosm.dataMapping[variable.name])
        .forEach(variable => {
          mesocosm.dataMapping[variable.id!] = mesocosm.dataMapping[variable.name];
        });
    });
    console.log(this.mesocosms);
    return combineLatest(this.mesocosms.map(mesocosm => this.addOrUpdateMesocosm(mesocosm)));
  }

  private addOrUpdateMesocosm(mesocosm: Mesocosm): Observable<Mesocosm> {
    return !mesocosm.id ? this.mesocosmService.add(mesocosm) : this.mesocosmService.update(mesocosm);
  }

  private deleteMesocosms(): Observable<void[] | string> {
    return this.deletedMesocosms.length > 0 ?
      combineLatest(this.deletedMesocosms.map(mesocosm => this.mesocosmService.delete(mesocosm))) :
      of('empty');
  }

  private saveVariables(partner: Partner): Observable<{ variables: Variable[], partner: Partner }> {
    this.variables.forEach(variable => variable.partnerId = partner.id!)
    return combineLatest(this.variables.map(variable => this.addOrUpdateVariable(variable)))
      .pipe(map(variables => { return { variables: variables, partner: partner } }));
  }

  private addOrUpdateVariable(variable: Variable): Observable<Variable> {
    return !variable.id ? this.variableService.add(variable) : this.variableService.update(variable);
  }

  private deleteVariables(partner: Partner): Observable<Partner> {
    return this.deletedVariables.length > 0 ?
      combineLatest(this.deletedVariables.map(variable => this.variableService.delete(variable)))
      .pipe(map(() => partner)) :
      of(partner);
  }

  private savePartner(): Observable<Partner> {
    this.partner.name = this.partner.displayName.replace(/\s/g, '');
    return this.isNew ? this.partnerService.add(this.partner) : this.partnerService.update(this.partner);
  }

}
