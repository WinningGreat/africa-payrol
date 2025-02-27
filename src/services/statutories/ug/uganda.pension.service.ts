import { round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import {
  StatutoryTypeSetting,
  StatutoryObject,
  StatutoryType,
  StatutorySubType,
  StatutoryTypeObject,
} from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";

export class UgandaPensionService implements IStatutoryService {
  getOrder(): number {
    return 2;
  }
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting
  ): StatutoryTypeObject {
    const grossMonthly = employee.base + payrollEmployee.totalBonus;

    // Define employer and employee contributions
    const employerPension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: false,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployersPension,
      setting,
      registryName: "Employer NSSF Contribution",
    };

    const employeePension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployeePension,
      setting,
      registryName: "Employee NSSF Contribution",
    };

    // Compute Pension contributions
    employerPension.annualAmount = round((10 / 100) * grossMonthly * 12, 2); // Employer contributes 10%
    employerPension.amount = round(employerPension.annualAmount / 12, 2);

    employeePension.annualAmount = round((5 / 100) * grossMonthly * 12, 2); // Employee contributes 5%
    employeePension.amount = round(employeePension.annualAmount / 12, 2);

    // Total contribution
    return {
      amount: employeePension.amount + employerPension.amount,
      type: StatutoryType.Pension,
      children: [employerPension, employeePension],
      registryName: "NSSF",
      setting,
    };
  }
}
