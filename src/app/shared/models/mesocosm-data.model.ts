export interface MesocosmData {
  id?: string;
  variableId: string;
  mesocosmId: string;
  data: TimePoint[];
}

export interface TimePoint {
  time: Date;
  value: number;
}
