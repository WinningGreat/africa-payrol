import { IStatutoryService } from "../statutories.interface";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { StatutoryTypeSetting, StatutoryObject, StatutoryType, StatutorySubType, StatutoryTypeObject } from "../../../types/statutory.types";
import { round } from "lodash";


export class KenyaTaxService implements IStatutoryService {
  getOrder(): number {
    return 1;
  }

  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting): StatutoryTypeObject {
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
    if (grossMonthly < 24000) {
      return {
        amount: taxResult.amount,
        type: StatutoryType.Tax,
        children: [taxResult],
        registryName: "PAYE(TAX)",
      };
    }

    const grossAnnualSalary = round(grossMonthly * 12, 2);


    const taxableAnnualIncome = Math.max(
      grossAnnualSalary - 28800,
      0,
    );

    const tax = this.calculateTax(taxableAnnualIncome, setting);
    taxResult.amount = round(tax/12, 2);
    taxResult.annualAmount = round(tax, 2);

    return {
      amount: tax,
      type: StatutoryType.Tax,
      children: [taxResult],
      registryName: "PAYE(TAX)",
    };
  }

  private calculateTax(taxableAnnualIncome: number, setting: StatutoryTypeSetting) {
    const brackets = [
      { limit: 288000, rate: 0.10 },
      { limit: 100000, rate: 0.25 },
      { limit: 5612000, rate: 0.30 },
      { limit: 3600000, rate: 0.325 },
      { limit: Infinity, rate: 0.35 },
  ];

  let tax = 0;
  let remainingIncome = taxableAnnualIncome;

  for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      const taxableAmount = Math.min(remainingIncome, bracket.limit);
      tax += taxableAmount * bracket.rate;
      remainingIncome -= taxableAmount;
  }

  return tax;
  }
}
