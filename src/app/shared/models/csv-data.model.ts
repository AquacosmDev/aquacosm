export interface CsvData {
  id?: number;
  variable: string;
  unit: string;
  mesocosm: string;
  time: string;
  value: number;
}

export interface CsvProfileData extends CsvData {
  startTime: string;
}
