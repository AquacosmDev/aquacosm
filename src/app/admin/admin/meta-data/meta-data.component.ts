import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetaDataService } from '@core/collections/meta-data.service';
import { MetaData } from '@shr/models/meta-data.model';
import { from, ReplaySubject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddMetaDataComponent } from '@app/admin/admin/meta-data/add-meta-data/add-meta-data.component';
import { SearchMetaDataService } from '@shr/search-meta-data.service';

@Component({
  selector: 'aqc-meta-data',
  templateUrl: './meta-data.component.html',
  styleUrls: ['./meta-data.component.scss'],
  providers: [ SearchMetaDataService ]
})
export class MetaDataComponent implements OnInit, OnDestroy {
  public metaData!: MetaData[];
  public filteredMetaData!: MetaData[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private metaDataService: MetaDataService, private router: Router,
              private afAuth: AngularFireAuth, private simpleModalService: SimpleModalService,
              private searchMetaDataService: SearchMetaDataService) { }

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

  public searchMetaData(searchValue: string) {
    this.filteredMetaData = this.searchMetaDataService.search(searchValue, this.metaData);
  }

  private getMetaData() {
    this.metaDataService.getAll()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(metaData => this.metaData = this.filteredMetaData = metaData);
  }
}
