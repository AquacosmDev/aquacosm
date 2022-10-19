import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, ReplaySubject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MetaDataEditorService } from '@core/collections/meta-data-editor.service';
import { MetaDataEditor } from '@shr/models/meta-data-editor.model';
import { MetaData } from '@shr/models/meta-data.model';
import { Partner } from '@shr/models/partner-model';
import { MetaDataService } from '@core/collections/meta-data.service';
import { PartnerService } from '@core/collections/partner.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private route: ActivatedRoute, private metaDataEditorService: MetaDataEditorService,
              private metaDataService: MetaDataService, private partnerService: PartnerService,
              private afAuth: AngularFireAuth) { }

  ngOnInit(): void {
    this.getMetaDataAndPartner();
    this.isLoggedIn();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
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
    console.log('HELLO');
    this.partnerService.get(id)
      .pipe(take(1))
      .subscribe(partner => {
        console.log(partner);
        this.partner = partner
      });
  }

  private isLoggedIn() {
    this.afAuth.authState
      .pipe(filter(user => !!user))
      .subscribe(user => {
        console.log(user);
        this.loggedIn = !!user
      })
  }

  private getEditors(metaDataId: string) {
    this.metaDataEditorService.getEditors(metaDataId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(editors => this.editors = editors);
  }
}
