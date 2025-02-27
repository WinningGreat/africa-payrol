import { IFee } from "./interface";

export class SzFeeService implements IFee {
  calculateFee(amount: number): number {
    return 0;
  }
}