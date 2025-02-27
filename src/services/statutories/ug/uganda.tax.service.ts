import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import {
  StatutoryTypeSetting,
  StatutoryObject,
  StatutoryType,
  StatutorySubType,
  StatutoryTypeObject,
} from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";

export class UgandaTaxService implements IStatutoryService {
  getOrder(): number {
    return 3;
  }
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting
  ): StatutoryTypeObject {
    const taxResult: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Tax,
      setting,
      subType: StatutorySubType.Tax,
      registryName: "PAYE",
    };
    const grossMonthly = employee.base + payrollEmployee.totalBonus;

    const lst = (
      payrollEmployee.statutories[StatutoryType.LST]?.amount || 0
    );

    const taxableIncome = grossMonthly - lst;

    const taxAmount = this.calculateMonthlyTax(taxableIncome, setting);

    taxResult.amount = taxAmount;
    taxResult.annualAmount = round(taxAmount * 12, 2);

    return {
      amount: taxResult.amount,
      type: StatutoryType.Tax,
      children: [taxResult],
      registryName: "PAYE",
    };
  }

  private calculateMonthlyTax(
    taxableIncome: number,
    setting: StatutoryTypeSetting
  ): number {
    if (setting.isWhtEnabled) {
      if (!setting.whtRate) {
        throw new Error("WHT rate is not set");
      }
      return taxableIncome * (setting.whtRate / 100);
    }
    if (taxableIncome <= 235000) {
      return 0; // Nil
    } else if (taxableIncome <= 335000) {
      return (taxableIncome - 235000) * 0.1; // 10% of the excess above 235,000
    } else if (taxableIncome <= 410000) {
      return (taxableIncome - 335000) * 0.2 + 10000; // 20% of the excess above 335,000 + 10,000
    } else if (taxableIncome <= 10000000) {
      return (taxableIncome - 410000) * 0.3 + 25000; // 30% of the excess above 410,000 + 25,000
    } else {
      return (
        (taxableIncome - 410000) * 0.3 +
        25000 +
        (taxableIncome - 10000000) * 0.1
      ); // 30% of the excess above 410,000 + 25,000 + 10% of the excess above 10,000,000
    }
  }
}
