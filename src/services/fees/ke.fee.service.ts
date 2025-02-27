// implement the IFee interface
import { IFee } from "./interface";

export class KeFeeService implements IFee {
  calculateFee(amount: number, mode?: 'compute' | 'regular'): number {
    if (mode === 'compute') {
      return 0;
    }
    return 0;
  }
}
