import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../../types/settings.types";
import { StatutoryTypeSetting, StatutoryTypeObject, StatutoryType, StatutorySubType, StatutoryObject } from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class EswatiniProvidentFundService implements IStatutoryService {
  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting, breakdowns?: SalaryBreakDown[]): StatutoryTypeObject {
    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    const salaryToUser = Math.min(grossMonthly, 2700);
    const employeeContribution = salaryToUser * (5 / 100);
    const employerContribution = salaryToUser * (5 / 100);

    const employeeProvidentFund: StatutoryObject = {
      amount: employeeContribution,
      annualAmount: employeeContribution * 12,
      deductFromEmployee: true,
      type: StatutoryType.ProvidentFund,
      subType: StatutorySubType.EmployeeProvidentFund,
      setting,
      registryName: "Employee Provident Fund",
    };

    const employerProvidentFund: StatutoryObject = {
      amount: employerContribution,
      annualAmount: employerContribution * 12,
      deductFromEmployee: false,
      type: StatutoryType.ProvidentFund,
      subType: StatutorySubType.EmployerProvidentFund,
      setting,
      registryName: "Employer Provident Fund",
    };

    return {
      amount: employeeContribution + employerContribution,
      type: StatutoryType.ProvidentFund,
      children: [employeeProvidentFund, employerProvidentFund],
      registryName: "Provident Fund",
    };
  }
  getOrder(): number {
    return 3;
  }
}