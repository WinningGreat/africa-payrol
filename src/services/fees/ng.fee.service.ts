// implement the IFee interface
import { IFee } from "./interface";

export class NgFeeService implements IFee {
  calculateFee(amount: number, mode?: 'compute' | 'regular'): number {
    if (mode === 'compute') {
      return 0;
    }
      if (amount <= 5000) {
        return 10;
      } else if (amount <= 50000) {
        return 25;
      } else {
        return 50;
      }
  }
}
