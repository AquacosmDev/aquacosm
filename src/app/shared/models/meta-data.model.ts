import { DateRange } from '@shr/models/date-range.model';
import { MetaDataHistory } from '@shr/models/meta-data-history.model';

export interface MetaData {
  id?: string;
  contact?: string;
  email?: string;
  partnerId: string;
  dateRange?: DateRange;
  description?: string;
  url?: string;
  history?: MetaDataHistory[];
  treatments?: Treatments;
}

export interface Treatments {
  description?: string;
  treatments?: Treatment[];
}

export interface Treatment {
  id: string;
  name?: string;
  mesocosmIds: string[];
}
