import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, from, map, Observable, ReplaySubject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MetaDataEditorService } from '@core/collections/meta-data-editor.service';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { MetaData } from '@shr/models/meta-data.model';
import { Partner } from '@shr/models/partner-model';
import { MetaDataService } from '@core/collections/meta-data.service';
import { PartnerService } from '@core/collections/partner.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ConnectPartnerComponent } from '@app/admin/admin/connect-partner/connect-partner.component';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddEditorComponent } from '@app/admin/admin/meta-data/meta-data-detail/add-editor/add-editor.component';
import { ConfirmModalComponent } from '@shr/components/confirm-modal/confirm-modal.component';
import { MetaDataHistory } from '@shr/models/meta-data-history.model';

@Component({
  selector: 'aqc-meta-data-detail',
  templateUrl: './meta-data-detail.component.html',
  styleUrls: ['./meta-data-detail.component.scss']
})
export class MetaDataDetailComponent implements OnInit, OnDestroy {

  public loggedIn = false;
  public credentials = {
    name: '',
    password: ''
  };
  public editor: MetaDataEditor;
  public metaData!: MetaData;
  public partner!: Partner;
  public editors!: MetaDataEditor[];

  public error!: string | null;
  public pristine = true;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private route: ActivatedRoute, private metaDataEditorService: MetaDataEditorService,
              private metaDataService: MetaDataService, private partnerService: PartnerService,
              private afAuth: AngularFireAuth, private simpleModalService: SimpleModalService,
              private router: Router) { }

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
        tap(metaData => this.getEditors(metaData.id)))
      .subscribe(metaData => this.metaData = metaData);
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
}
