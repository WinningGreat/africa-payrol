import { isEmpty, keyBy, round } from "lodash";
import { Employee } from "../types/employee.types";
import { BuildPayrollOption, IPayroll } from "../types/payroll.types";
import { IPayrollEmployee } from "../types/payroll_employee.types";
import { PayrollEmployeeBuilder } from "./payroll_employee.builder";
import { StatutoryType } from "../types/statutory.types";

export class PayrollBuilder {
  private option: BuildPayrollOption;
  private employees: Employee[];
  private payrollEmployeeMap: Map<string, IPayrollEmployee>;
  private totalEmployees: number;
  private payroll: IPayroll;

  constructor(option: BuildPayrollOption) {
    this.option = option;
    this.employees = option.employees;
    this.totalEmployees = option.employees.length;
    this.payrollEmployeeMap = new Map<string, IPayrollEmployee>();
    this.payroll = {
      month: this.option.month,
      year: this.option.year,
      organizationId: this.option.organizationId,
      totalPayrollAmount: 0,
      totalCharge: 0,
      totalFees: 0,
      totalBase: 0,
      totalDeductions: 0,
      totalBonus: 0,
      currency: this.option.currency,
      payrollEmployees: [],
      includedPayrollEmployees: [],
      id: this.option.payrollId || undefined,
      totalNet: 0,
      statutories: {} as any,
      totalPerks: 0,
    };
  }

  private updateTotals(
    pEmp: IPayrollEmployee,
    isAddition: boolean = true
  ): void {
    const factor = isAddition ? 1 : -1;
    this.payroll.totalCharge = round(
      this.payroll.totalCharge + factor * pEmp.totalCharge,
      2
    );
    this.payroll.totalPayrollAmount = round(
      this.payroll.totalPayrollAmount + factor * pEmp.totalAmount,
      2
    );
    this.payroll.totalFees = round(
      this.payroll.totalFees + factor * pEmp.totalFee,
      2
    );
    this.payroll.totalBase = round(
      this.payroll.totalBase + factor * pEmp.base,
      2
    );
    this.payroll.totalNet = round(this.payroll.totalNet + factor * pEmp.net, 2);
    this.payroll.totalDeductions = round(
      this.payroll.totalDeductions + factor * pEmp.totalDeductions,
      2
    );
    this.payroll.totalBonus = round(
      this.payroll.totalBonus + factor * pEmp.totalBonus,
      2
    );

    this.payroll.totalPerks = round(
      this.payroll.totalPerks + factor * pEmp.totalPerks,
      2
    );

    Object.keys(pEmp.statutories).forEach((stat) => {
      const type = stat as StatutoryType;
      if (!this.payroll.statutories[type]) {
        this.payroll.statutories[type] = {
          amount: 0,
          children: [],
          type,
          registryName: pEmp.statutories[type].registryName,
        };
      }
      let childrenSubType = keyBy(
        this.payroll.statutories[type].children,
        "subType"
      );
      const childrenArr = [];
      for (const statChild of pEmp.statutories[type].children) {
        const totalsChild = childrenSubType[statChild.subType] || {
          amount: 0,
          annualAmount: 0,
          type,
          subType: statChild.subType,
        };

        //add
        this.payroll.statutories[type].amount = round(
          this.payroll.statutories[type].amount + factor * statChild.amount,
          2
        );
        totalsChild.amount = round(
          totalsChild.amount + factor * statChild.amount,
          2
        );
        totalsChild.annualAmount = round(
          totalsChild.annualAmount + factor * statChild.annualAmount,
          2
        );
        childrenSubType[statChild.subType] = totalsChild;
        childrenArr.push(totalsChild);
      }

      this.payroll.statutories[type].children = childrenArr;
    });
  }

  build(): IPayroll {
    for (let i = 0; i < this.totalEmployees; i++) {
      const employee = this.employees[i];

      const pEmp = new PayrollEmployeeBuilder({
        employee,
        salaryBreakDown: this.option.salaryBreakDown,
        month: this.option.month,
        year: this.option.year,
        index: i,
        payrollId: this.option.payrollId,
        organizationId: this.option.organizationId,
        statutorySettings: this.option.statutorySettings,
        groups: this.option.groups,
        country: this.option.country,
        mode: this.option.mode,
      }).build();

      this.payrollEmployeeMap.set(employee.id, pEmp);
      this.payroll.payrollEmployees.push(pEmp);

      if (employee.isCheckedOnWorkSheet) {
        this.payroll.includedPayrollEmployees.push(pEmp);
        this.updateTotals(pEmp, true);
      }
    }
    return this.payroll;
  }

  updateSingleEmployee(opts: {
    index?: number;
    id?: string;
    update: Employee;
  }): IPayroll {
    const { index, id, update } = opts;

    if (!index && !id) {
      throw new Error("you have to provide an id or index");
    }

    let existingPayrollEmp: IPayrollEmployee | undefined;

    if (index !== undefined) {
      existingPayrollEmp = this.payroll.payrollEmployees[index];
      if (!existingPayrollEmp) {
        throw new Error(`employee at index ${index} not found`);
      }
    } else {
      existingPayrollEmp = this.payrollEmployeeMap.get(id!);
      if (!existingPayrollEmp) {
        throw new Error(`employee with id ${id} not found`);
      }
    }

    if (existingPayrollEmp!.isCheckedOnWorkSheet) {
      this.updateTotals(existingPayrollEmp!, false); // Remove previous values from the totals
    }

    const newPayrollEmp = new PayrollEmployeeBuilder({
      employee: update,
      salaryBreakDown: this.option.salaryBreakDown,
      month: this.option.month,
      year: this.option.year,
      index: existingPayrollEmp!.index,
      payrollId: this.option.payrollId,
      organizationId: this.option.organizationId,
      statutorySettings: this.option.statutorySettings,
      groups: this.option.groups,
      country: this.option.country,
    }).build();

    this.payrollEmployeeMap.set(update.id, newPayrollEmp);
    this.payroll.payrollEmployees[newPayrollEmp.index] = newPayrollEmp;

    if (newPayrollEmp.isCheckedOnWorkSheet) {
      this.updateTotals(newPayrollEmp, true); // Add new values to the totals
    }

    return this.payroll;
  }
}
