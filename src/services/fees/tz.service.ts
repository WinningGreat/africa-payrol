import { IFee } from "./interface";

export class TzFeeService implements IFee {
  calculateFee(amount: number): number {
    return 0;
  }
}