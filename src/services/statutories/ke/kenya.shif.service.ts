import { max, round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { StatutoryObject, StatutorySubType, StatutoryType, StatutoryTypeObject, StatutoryTypeSetting } from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class KenyaShifService implements IStatutoryService {
  getOrder(): number {
    return 3;
  }

  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting): StatutoryTypeObject {
    const shif: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Shif,
      subType: StatutorySubType.Shif,
      setting,
      registryName: "SHIF",
    };

    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    shif.amount = max([grossMonthly * (2.75 / 100), 300]) ?? 0;
    shif.annualAmount = round(shif.amount * 12, 2);

    return {
      amount: shif.amount,
      type: StatutoryType.Shif,
      children: [shif],
      registryName: "SHIF",
    };
  }
}