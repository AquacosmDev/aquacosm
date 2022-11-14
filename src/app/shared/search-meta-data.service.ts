import { Injectable } from '@angular/core';
import { MetaData } from '@shr/models/meta-data.model';

@Injectable()
export class SearchMetaDataService {

  constructor() { }

  public search(value: string, metaData: MetaData[]): MetaData[] {
    return metaData.filter(data => this.searchData(value, data));
  }

  private searchData(value: string, metaData: MetaData): boolean {
    return (metaData.email && metaData.email.includes(value)) ||
      ( metaData.researchAim && metaData.researchAim.includes(value)) ||
      (metaData.contact && metaData.contact.includes(value));
  }
}
