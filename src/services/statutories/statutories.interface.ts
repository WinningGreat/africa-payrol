import { Employee } from "../../types/employee.types";
import { IPayrollEmployee } from "../../types/payroll_employee.types";
import { SalaryBreakDown } from "../../types/settings.types";
import {
  StatutoryTypeObject,
  StatutoryObject,
  StatutoryTypeSetting,
  StatutoryType,
} from "../../types/statutory.types";

export interface IStatutoryService {
  calculate(
    employee: Employee,
    payrollEmployee: IPayrollEmployee,
    setting: StatutoryTypeSetting,
    breakdowns?: SalaryBreakDown[]
  ): StatutoryTypeObject;

  getOrder(

  ): number;
}
