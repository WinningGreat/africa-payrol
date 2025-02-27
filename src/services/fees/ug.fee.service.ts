// implement the IFee interface
import { round } from "lodash";
import { IFee } from "./interface";

export class UgFeeService implements IFee {
  calculateFee(amount: number, mode?: 'compute' | 'regular'): number {
    if (mode === 'compute') {
      return 0;
    }
    const feeBrackets = [
        { from: 0, to: 250000, fee: 5000 },
        { from: 250001, to: 500000, fee: 6000 },
        { from: 500001, to: 1000000, fee: 9000 },
        { from: 1000001, to: 2000000, fee: 13500 },
        { from: 2000001, to: 50000000, fee: 16500 },
      ]
    if (amount <= 0) {
      return 0;
    }

    if (amount > 50000000) {
        return 16500;
    }
  const amountToUse = round(amount, 0)
    // Find the correct fee bracket
    const bracket = feeBrackets.find(
      ({ from, to }) => amountToUse >= from && amountToUse <= to,
    );

    if (bracket) return bracket.fee;

    throw new Error('Amount out of range');
  }
}
