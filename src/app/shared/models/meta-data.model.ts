import { DateRange } from '@shr/models/date-range.model';
import { MetaDataHistory } from '@shr/models/meta-data-history.model';

export interface MetaData {
  id?: string;
  contact?: string;
  partnerId: string;
  dateRange?: DateRange;
  description?: string;
  url?: string;
  history?: MetaDataHistory[];
}
