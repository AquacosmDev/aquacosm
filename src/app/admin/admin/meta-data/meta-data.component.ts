import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetaDataService } from '@core/collections/meta-data.service';
import { MetaData } from '@shr/models/meta-data.model';
import { from, ReplaySubject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AddEditorComponent } from '@app/admin/admin/meta-data/meta-data-detail/add-editor/add-editor.component';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddMetaDataComponent } from '@app/admin/admin/meta-data/add-meta-data/add-meta-data.component';

@Component({
  selector: 'aqc-meta-data',
  templateUrl: './meta-data.component.html',
  styleUrls: ['./meta-data.component.scss']
})
export class MetaDataComponent implements OnInit, OnDestroy {
  public metaData!: MetaData[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private metaDataService: MetaDataService, private router: Router,
              private afAuth: AngularFireAuth, private simpleModalService: SimpleModalService) { }

  ngOnInit(): void {
    this.getMetaData();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public addMetadataEntry() {
    this.simpleModalService.addModal(AddMetaDataComponent, { });
  }

  public logoff() {
    from(this.afAuth.signOut()).subscribe(() => this.router.navigate(['login']));
  }

  public toAdminOverview() {
    this.router.navigate([ 'admin' ]);
  }

  private getMetaData() {
    this.metaDataService.getAll()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(metaData => this.metaData = metaData);
  }

}
