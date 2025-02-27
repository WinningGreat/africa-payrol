import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import { StatutoryTypeSetting, StatutoryTypeObject, StatutoryType, StatutoryObject, StatutorySubType } from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class KenyaHousingLevyService implements IStatutoryService {
  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting, breakdowns?: SalaryBreakDown[]): StatutoryTypeObject {
      
    const housingLevy: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.HousingLevy,
      setting,
      subType: StatutorySubType.HousingLevy,
      registryName: "HOUSING LEVY",
    };

    const grossMonthly = employee.base + payrollEmployee.totalBonus;

    housingLevy.amount = round(grossMonthly * (1.5 / 100), 2);
    housingLevy.annualAmount = round(housingLevy.amount * 12, 2);

    return {
      amount: housingLevy.amount,
      type: StatutoryType.HousingLevy,
      children: [housingLevy],
      registryName: "HOUSING LEVY",
    };
  }
  getOrder(): number {
    return 4;
  }
}