export interface MesocosmData {
  id?: string;
  variableId: string;
  mesocosmId: string;
  data: TimePoint[];
  day?: number;
  year?: number;
}

export interface TimePoint {
  minuteOfDay?: number;
  time: Date;
  value: number | null;
  rollingAverage?: number | null;
  standardDeviation?: number | null;
}
