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

export class NigeriaTaxService implements IStatutoryService {
  getOrder(): number {
    return 2;
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
      registryName: "PAYE(TAX)",
    };
    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    if (grossMonthly < 70000) {
      return {
        amount: taxResult.amount,
        type: StatutoryType.Tax,
        children: [taxResult],
        registryName: "PAYE(TAX)",
      };
    }
    const grossAnnualSalary = round(grossMonthly * 12, 2);

    const annualPension = (
      payrollEmployee.statutories[StatutoryType.Pension]?.children || []
    )
      .filter((x) => x.subType !== StatutorySubType.EmployersPension)
      .reduce((a, b) => a + b.annualAmount, 0);
    const grossAnnualSalaryAfterRemovingRelief =
      grossAnnualSalary - annualPension;
    const consolidatedRelief = this.calculateConsolidatedReliefs(
      grossAnnualSalary,
      grossAnnualSalaryAfterRemovingRelief
    );

    const totalRelief = annualPension + consolidatedRelief;

    const taxableAnnualIncome = grossAnnualSalary - totalRelief;

    taxResult.annualAmount = this.calculateTax(taxableAnnualIncome, setting);

    taxResult.amount = round(taxResult.annualAmount / 12, 2);

    return {
      amount: taxResult.amount,
      type: StatutoryType.Tax,
      children: [taxResult],
      registryName: "TAX",
      setting,
    };
  }

  private calculateConsolidatedReliefs(
    grossAnnualSalary: number,
    grossAnnualSalaryAfterRemovingRelief: number
  ) {
    // calculate all reliefs which are consolidated relief, pensions
    let consolidatedRelief1 =  (1 / 100) * grossAnnualSalary;
    if (consolidatedRelief1 < 200000) {
      consolidatedRelief1 = 200000;
    }
    const consolidatedRelief2 =
      (20 / 100) * grossAnnualSalaryAfterRemovingRelief;

    return consolidatedRelief1 + consolidatedRelief2;
  }

  private calculateTax(
    taxableAnnualIncome: number,
    setting: StatutoryTypeSetting
  ) {
    if (setting.isWhtEnabled) {
      if (!setting.whtRate) {
        throw new Error("WHT rate is not set");
      }
      return (setting.whtRate / 100) * taxableAnnualIncome;
    }

    if (taxableAnnualIncome < 300000) {
      return (1 / 100) * taxableAnnualIncome;
    }
    let tax = 0;

    // Tax brackets
    const taxBrackets = [
      { limit: 300000, rate: 0.07 },
      { limit: 300000, rate: 0.11 },
      { limit: 500000, rate: 0.15 },
      { limit: 500000, rate: 0.19 },
      { limit: 1600000, rate: 0.21 },
      { limit: Infinity, rate: 0.24 },
    ];

    let remainingIncome = taxableAnnualIncome;

    for (let i = 0; i < taxBrackets.length; i++) {
      const { limit, rate } = taxBrackets[i];

      if (remainingIncome <= limit) {
        tax += remainingIncome * rate;
        break;
      } else {
        tax += limit * rate;
        remainingIncome -= limit;
      }
    }

    return tax;
  }
}
