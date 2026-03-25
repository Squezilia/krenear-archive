export interface Item {
  title: string;
  icon: string;
  action: (data?: Record<string, any>) => void;
}
