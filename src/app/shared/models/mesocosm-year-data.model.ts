import { TimePoint } from '@shr/models/mesocosm-data.model';

export interface MesocosmYearData {
  id?: string;
  variableId: string;
  mesocosmId: string;
  data: TimePoint[];
  year: number;
}
