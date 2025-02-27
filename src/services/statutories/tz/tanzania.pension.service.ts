import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import {
  StatutoryTypeSetting,
  StatutoryTypeObject,
  StatutorySubType,
  StatutoryType,
  StatutoryObject,
} from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class TanzaniaPensionService implements IStatutoryService {
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting,
    breakdowns?: SalaryBreakDown[]
  ): StatutoryTypeObject {
    const employerPension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: false,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployersPension,
      setting,
      registryName: "NSSF",
    };
    const employeePension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployeePension,
      setting,
      registryName: "NSSF",
    };
    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    // Compute Pension contributions, custom or 10%
    employerPension.annualAmount = round(
      (setting.employerRate || 10 / 100) * grossMonthly * 12,
      2
    );
    employerPension.amount = round(employerPension.annualAmount / 12, 2);

    // Employee contribution, 10%
    employeePension.annualAmount = round((10 / 100) * grossMonthly * 12, 2); // Employee contributes 5%
    employeePension.amount = round(employeePension.annualAmount / 12, 2);

    return {
      amount: employerPension.amount + employeePension.amount,
      type: StatutoryType.Pension,
      children: [employerPension, employeePension],
      registryName: "NSSF",
      setting,
    };
  }
  getOrder(): number {
    return 1;
  }
}
