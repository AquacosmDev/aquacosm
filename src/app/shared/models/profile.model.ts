export interface Profile {
  id?: string;
  partnerId: string;
  startTime: Date;
  mesocosms: string[];
  data: ProfileData[];
}

export interface ProfileData {
  time: Date;
  [ value: string ]: number | null | Date;
}
