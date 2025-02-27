import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import {
  StatutoryTypeSetting,
  StatutoryTypeObject,
  StatutoryType,
  StatutoryObject,
  StatutorySubType,
} from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class EswatiniPensionService implements IStatutoryService {
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
      registryName: "EMPLOYER NATIONAL PROVIDENT FUND",
    };
    const employeePension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployeePension,
      setting,
      registryName: "EMPLOYEE NATIONAL PROVIDENT FUND",
    };
    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    // Compute Pension contributions
    employerPension.annualAmount = round((5 / 100) * grossMonthly * 12, 2); // Employer contributes 5%
    employerPension.amount = round(employerPension.annualAmount / 12, 2);

    employeePension.annualAmount = round((5 / 100) * grossMonthly * 12, 2); // Employee contributes 5%
    employeePension.amount = round(employeePension.annualAmount / 12, 2);

    return {
      amount: employeePension.amount + employerPension.amount,
      type: StatutoryType.Pension,
      children: [employeePension, employerPension],
      registryName: "ENPF",
      setting,
    };
  }
  getOrder(): number {
    return 1;
  }
}
