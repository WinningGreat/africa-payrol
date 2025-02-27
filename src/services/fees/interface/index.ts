// create generic fee interface
export interface IFee {
  calculateFee(amount: number, mode?: 'compute' | 'regular'): number;
}
