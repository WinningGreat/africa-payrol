import { clone, round } from "lodash";
import { Employee } from "../../../types/employee.types";
import { IPayrollEmployee } from "../../../types/payroll_employee.types";
import { StatutoryObject, StatutorySubType, StatutoryType, StatutoryTypeObject, StatutoryTypeSetting } from "../../../types/statutory.types";
import { IStatutoryService } from "../statutories.interface";

export class KenyaPensionService implements IStatutoryService {
  getOrder(): number {
    return 1;
  }

  calculate(employee: Employee, payrollEmployee: IPayrollEmployee, setting: StatutoryTypeSetting): StatutoryTypeObject {
    const employerPension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: false,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployersPension,
      setting,
      registryName: "EMPLOYER NSSF",
    };

    const employeePension: StatutoryObject = {
      amount: 0,
      annualAmount: 0,
      deductFromEmployee: true,
      type: StatutoryType.Pension,
      subType: StatutorySubType.EmployeePension,
      setting,
      registryName: "EMPLOYEE NSSF",
    };
     

    const grossMonthly = employee.base + payrollEmployee.totalBonus;
    const employeePensionAmount = this.calculateNSSFContribution(grossMonthly);
    const employerPensionAmount = clone(employeePensionAmount);

    employeePension.amount = employeePensionAmount;
    employeePension.annualAmount = round(employeePensionAmount * 12, 2);
    employerPension.amount = employerPensionAmount;
    employerPension.annualAmount = round(employerPensionAmount * 12, 2);

    return {
      amount: employeePensionAmount + employerPensionAmount,
      type: StatutoryType.Pension,
      children: [employeePension, employerPension],
      registryName: "NSSF",
    };
  }

  calculateNSSFContribution(salary: number): number {
    const lowerLimit = 8000;
    const upperLimit = 72000;
    const lowerRate = 0.06; // 6%
    const upperRate = 0.06; // 6%

    let tier1Contribution = Math.min(salary, lowerLimit) * lowerRate;
    let tier2Contribution = 0;

    if (salary > lowerLimit) {
        tier2Contribution = Math.min(salary, upperLimit) - lowerLimit;
        tier2Contribution *= upperRate;
    }

    return tier1Contribution + tier2Contribution;
}
  
  

}
