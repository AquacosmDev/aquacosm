import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, from, map, Observable, ReplaySubject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MetaDataEditorService } from '@core/collections/meta-data-editor.service';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { MetaData, Treatment } from '@shr/models/meta-data.model';
import { Partner } from '@shr/models/partner-model';
import { MetaDataService } from '@core/collections/meta-data.service';
import { PartnerService } from '@core/collections/partner.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddEditorComponent } from '@app/admin/admin/meta-data/meta-data-detail/add-editor/add-editor.component';
import { ConfirmModalComponent } from '@shr/components/confirm-modal/confirm-modal.component';
import { MetaDataHistory } from '@shr/models/meta-data-history.model';
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs';
import { MesocosmService } from '@core/collections/mesocosm.service';
import { Mesocosm } from '@shr/models/mesocosm.model';

@Component({
  selector: 'aqc-meta-data-detail',
  templateUrl: './meta-data-detail.component.html',
  styleUrls: ['./meta-data-detail.component.scss']
})
export class MetaDataDetailComponent implements OnInit, OnDestroy {
  public NgxPopperjsTriggers = NgxPopperjsTriggers;
  public NgxPopperjsPlacements = NgxPopperjsPlacements;

  private library = '0123456789'

  public loggedIn = false;
  public credentials = {
    name: '',
    password: ''
  };
  public editor: MetaDataEditor;
  public metaData!: MetaData;
  public partner!: Partner;
  public mesocosms!: Mesocosm[];
  public treatments: Treatment[];
  public editors!: MetaDataEditor[];
  public selectedTreatments: string[] = [];

  public error!: string | null;
  public pristine = true;
  public mandatoryFields = false;
  public isEmail = true;
  private emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private route: ActivatedRoute, private metaDataEditorService: MetaDataEditorService,
              private metaDataService: MetaDataService, private partnerService: PartnerService,
              private afAuth: AngularFireAuth, private simpleModalService: SimpleModalService,
              private router: Router, private mesocosmService: MesocosmService) { }

  ngOnInit(): void {
    this.getMetaDataAndPartner();
    this.isLoggedIn();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public onChange() {
    this.pristine = false;
    this.mandatoryFields = !!this.metaData.contact && !!this.metaData.email && !!this.metaData.description && !!this.metaData.dateRange && !!this.metaData.dateRange.start;
  }

  public onEmailChange(value: string) {
    this.isEmail = this.emailPattern.test(value);
  }

  public changeTreatment() {
    this.treatments = this.metaData.treatments.treatments.filter(treatment => !!treatment.name);
  }

  public addTreatment() {
    this.metaData.treatments.treatments.push({
      id: this.generateId(),
      mesocosmIds: []
    });
    this.treatments = this.metaData.treatments.treatments.filter(treatment => !!treatment.name);
  }

  public deleteTreatment(index: number) {
    const deleted = this.metaData.treatments.treatments.splice(index, 1);
    this.selectedTreatments = this.selectedTreatments.map(id => {
      let newValue;
      if (id === deleted[ 0 ].id) {
        newValue = null
      } else {
        newValue = id
      }
      return newValue;
    });
    this.treatments = this.metaData.treatments.treatments.filter(treatment => !!treatment.name);
  }

  public addMesocosmIdToTreatment(mesocosmId: string, treatmentId: string) {
    this.metaData.treatments.treatments.find(treatment => treatment.id === treatmentId).mesocosmIds.push(mesocosmId);
  }

  public save() {
    if (this.loggedIn || !!this.editor) {
      const history: MetaDataHistory = {
        editor: this.loggedIn ? 'admin' : this.editor.email,
        date: new Date(),
        action: 'update'
      }
      if (!this.metaData.history) {
        this.metaData.history = [];
      }
      this.metaData.history.push(history);
      this.metaDataService.update(this.metaData)
        .subscribe(() => this.pristine = true);
    }
  }

  public addEditor() {
    this.simpleModalService.addModal(AddEditorComponent, { metaDataId: this.metaData.id });
  }

  public deleteEditor(editor: MetaDataEditor) {
    this.simpleModalService.addModal(ConfirmModalComponent, { title: 'Delete Editor', message: `Are you sure you want to delete editor: ${editor.email}?`})
      .pipe(
        filter(result => result),
        switchMap(() => this.metaDataEditorService.delete(editor)))
      .subscribe();
  }

  public login() {
    this.error = null;
    this.metaDataEditorService.getMetaDataEditor(this.credentials.name, this.credentials.password, this.metaData.id)
      .pipe(take(1))
      .subscribe(editor =>  {
        if (!!editor) {
          this.editor = editor;
        } else {
          this.error = 'The username and/or password are not correct.'
        }
      })
  }

  public logoff() {
    if (this.loggedIn) {
      from(this.afAuth.signOut()).subscribe(() => this.router.navigate(['login']));
    }

    if (this.editor) {
      this.editor = null;
      this.credentials = {
        name: '',
        password: ''
      };
    }
  }

  public toMetadataOverview() {
    if (this.loggedIn) {
      this.router.navigate(['admin', 'meta-data']);
    }
  }

  private getMetaDataAndPartner() {
    this.route.params
      .pipe(
        take(1),
        map(params => params['id']),
        switchMap(id => this.getMetaData(id)),
        tap(metaData => this.getPartner(metaData.partnerId)),
        tap(metaData => this.getMesocosms(metaData.partnerId)),
        tap(metaData => this.getEditors(metaData.id)))
      .subscribe(metaData => {
        this.metaData = metaData;
        this.treatments = this.metaData.treatments.treatments.filter(treatment => !!treatment.name);
      });
  }

  private getMetaData(id: string): Observable<MetaData> {
    return this.metaDataService.get(id)
      .pipe(take(1));
  }

  private getPartner(id: string) {
    this.partnerService.get(id)
      .pipe(take(1))
      .subscribe(partner => this.partner = partner);
  }

  private getMesocosms(partnerId: string) {
    this.mesocosmService.getMesocosmsByPartnerIdSortedByName(partnerId)
      .pipe(take(1))
      .subscribe(mesocosms => {
        this.mesocosms = mesocosms;
        this.mesocosms.forEach(mesocosm => {
          const treatment = this.metaData.treatments.treatments.find(treatment => treatment.mesocosmIds.includes(mesocosm.id));
          if (!!treatment) {
            this.selectedTreatments.push(treatment.id);
          } else {
            this.selectedTreatments.push(null);
          }
        })
      });
  }

  private isLoggedIn() {
    this.afAuth.authState
      .pipe(filter(user => !!user))
      .subscribe(user => this.loggedIn = !!user);
  }

  private getEditors(metaDataId: string) {
    this.metaDataEditorService.getEditors(metaDataId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(editors => this.editors = editors);
  }

  private generateId(): string {
    let password = '';
    for (let i = 0; i < 5; i++) {
      password += this.library[Math.floor(Math.random() * this.library.length)];
    }
    return password;
  }
}
