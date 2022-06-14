export interface Mesocosm {
  id?: string;
  name: string;
  partnerId: string;
  dataMapping: { [variableId: string]: string }
}
