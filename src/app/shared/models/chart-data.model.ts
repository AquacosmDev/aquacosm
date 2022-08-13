import { TimePoint } from '@shr//models/mesocosm-data.model';

export interface ChartData {
  label: string;
  data: TimePoint[];
  mesocosmId: string;
  variableId: string;
}
