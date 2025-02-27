import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { StatutoryTypeSetting, StatutoryTypeObject, StatutoryType, StatutorySubType } from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class UgandaLstService implements IStatutoryService {
  getOrder(): number {
    return 1;
  }
  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting): StatutoryTypeObject {
    const grossMonthly = employee.base + payrollEmployee.totalBonus;

    // calculate uganda local service tax
    const lst = this.calculateLST(grossMonthly);
    return {
      amount: lst,
      type: StatutoryType.LST,
      children: [
        {
          amount: lst,
          type: StatutoryType.LST,
          deductFromEmployee: true,
          annualAmount: round(lst * 12, 2),
          subType: StatutorySubType.LST,
          setting,
          registryName: 'LST',
        },
      ],
      registryName: 'LST',
      setting,
    };
  }


private calculateLST(monthlyIncome: number): number {

const incomeBrackets = [
    { min: 100000, max: 200000, lst: 5000 },
    { min: 200000, max: 300000, lst: 10000 },
    { min: 300000, max: 400000, lst: 20000 },
    { min: 400000, max: 500000, lst: 30000 },
    { min: 500000, max: 600000, lst: 40000 },
    { min: 600000, max: 700000, lst: 60000 },
    { min: 700000, max: 800000, lst: 70000 },
    { min: 800000, max: 900000, lst: 80000 },
    { min: 900000, max: 1000000, lst: 90000 },
    { min: 1000000, max: Infinity, lst: 100000 }
    ];
    for (const bracket of incomeBrackets) {
      if (monthlyIncome > bracket.min && monthlyIncome <= bracket.max) {
        return bracket.lst;
      }
    }
    return 0; // If no bracket matches
}
}