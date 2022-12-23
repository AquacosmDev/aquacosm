export interface ChecklistItem<T> {
  checked: boolean;
  item: T;
  reselect?: boolean;
  name?: string;
  disabled?: boolean;
}
