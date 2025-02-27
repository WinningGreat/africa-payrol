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

export class NigeriaPensionService implements IStatutoryService {
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting,
    breakdowns: SalaryBreakDown[]
  ): StatutoryTypeObject {
    const annualBase = round(
      (employee.base + payrollEmployee.totalBonus) * 12,
      2
    );
    const employerPension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: false,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployersPension,
      setting,
      registryName: "Employer Pension Contribution",
    };
    const employeesPension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployeePension,
      setting,
      registryName: "Employee Pension Contribution",
    };

    let totalBHT = 0;

    breakdowns.forEach((breakdown) => {
      if (
        ["basic", "housing", "transportation"].includes(
          breakdown.name.toLowerCase()
        )
      ) {
        totalBHT += (breakdown.percentage / 100) * annualBase;
      }
    });
    employerPension.annualAmount = (10 / 100) * (totalBHT || annualBase);
    employerPension.amount = round(employerPension.annualAmount / 12, 2);

    employeesPension.annualAmount = (8 / 100) * (totalBHT || annualBase);
    employeesPension.amount = round(employeesPension.annualAmount / 12, 2);

    return {
      amount: employeesPension.amount + employerPension.amount,
      type: StatutoryType.Pension,
      children: [employerPension, employeesPension],
      registryName: "Pension",
      setting,
    };
  }

  getOrder(): number {
    return 1;
  }
}
