import { Variable } from '@shr/models/variable.model';

export interface ProfileChartData {
  variable: Variable;
  datasets: ProfileDataSet[];
  times: Date[];
  startTime: Date;
}

export interface ProfileDataSet {
  label: string;
  data: number[];
}
