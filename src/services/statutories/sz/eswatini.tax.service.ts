import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import {
  StatutoryTypeSetting,
  StatutoryTypeObject,
  StatutoryType,
  StatutorySubType,
  StatutoryObject,
} from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class EswatiniTaxService implements IStatutoryService {
  getOrder(): number {
    return 2;
  }
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting,
    breakdowns?: SalaryBreakDown[]
  ): StatutoryTypeObject {
    const taxResult: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Tax,
      setting,
      subType: StatutorySubType.Tax,
      registryName: "PAYE(TAX)",
    };
    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    const grossAnnualSalary = round(grossMonthly * 12, 2);
    taxResult.annualAmount = this.calculateTax(grossAnnualSalary);
    taxResult.amount = round(taxResult.annualAmount / 12, 2);

    return {
      amount: taxResult.amount,
      type: StatutoryType.Tax,
      children: [taxResult],
      registryName: "TAX",
      setting,
    };
  }

  calculateTax(income: number): number {
    const taxableThreshold = 41000;

    // No tax if income is below taxable threshold
    if (income < taxableThreshold) return 0;
    // Tax brackets
    const brackets = [
      { limit: 100000, base: 0, rate: 0.2 },
      { limit: 150000, base: 20000, rate: 0.25 },
      { limit: 200000, base: 32500, rate: 0.3 },
      { limit: Infinity, base: 47500, rate: 0.33 },
    ];

    let tax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
      if (income > previousLimit) {
        const taxableAmount = Math.min(income, bracket.limit) - previousLimit;
        tax = bracket.base + taxableAmount * bracket.rate;
      }
      previousLimit = bracket.limit;
      if (income <= bracket.limit) break;
    }

    return Math.max(tax - 8200, 0);
  }
}
