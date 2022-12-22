export interface Profile {
  id?: string;
  partnerId: string;
  startTime: Date;
  data: ProfileData[]
}

export interface ProfileData {
  time: Date;
  [ value: string ]: number | null | Date;
}
