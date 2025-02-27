
import { IStatutoryService } from "../statutories.interface";
import { StatutorySubType, StatutoryType, StatutoryTypeObject } from "../../../types/statutory.types";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { StatutoryTypeSetting } from "../../../types/statutory.types";
import { round } from "lodash";


export class TanzaniaTaxService implements IStatutoryService {
  getOrder(): number {
    return 2;
  }
  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting): StatutoryTypeObject {
    const monthlyIncome = employee.base + payrollEmployee.totalBonus;
    const monthlyPension = (
        payrollEmployee.statutories[StatutoryType.Pension]?.children || []
      )
        .filter((x) => x.subType !== StatutorySubType.EmployersPension)
        .reduce((a, b) => a + b.amount, 0);
    const taxableIncome = monthlyIncome - monthlyPension;
    const tax = this.calculateMonthlyTax(taxableIncome);
    return {
      amount: tax,
      type: StatutoryType.Tax,
      children: [
        {
          amount: tax,
          type: StatutoryType.Tax,
          deductFromEmployee: true,
          annualAmount: round(tax * 12, 2),
          subType: StatutorySubType.Tax,
          setting,
          registryName: 'PAYE',
        },
      ],
      registryName: 'PAYE',
      setting,
    };
  }

calculateMonthlyTax(income: number): number {
    if (income <= 270000) {
        return 0;
    } else if (income <= 520000) {
        return (income - 270000) * 0.08;
    } else if (income <= 760000) {
        return 20000 + (income - 520000) * 0.20;
    } else if (income <= 1000000) {
        return 68000 + (income - 760000) * 0.25;
    } else {
        return 128000 + (income - 1000000) * 0.30;
    }
}
}
