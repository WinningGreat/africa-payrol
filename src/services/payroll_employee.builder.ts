import { AddOnType, Employee } from "../types/employee.types";
import { clone, round } from "lodash";
import {
  EmployeeSalaryBreakDown,
  EmployeeSalaryBreakDownAction,
  SalaryBreakDownType,
} from "../types/employee_salary_breakdown.types";
import {
  BuildPayrollEmployeeOption,
  IPayrollEmployee,
} from "../types/payroll_employee.types";
import {
  IPayrollEmployeeRepaymentSchedule,
  IPayrollEmployeeRepaymentScheduleStatus,
  IRepaymentSchedule,
} from "../types/repayment_schedule.types";
import { StatutoryType } from "../types/statutory.types";
import { StatutoryService } from "./statutories/statutories.service";
import { FeeService } from "./fees/fee.service";

export class PayrollEmployeeBuilder {
  private employee: Employee;
  private options: BuildPayrollEmployeeOption;
  private payrollEmployee: IPayrollEmployee;
  private statutoryService = new StatutoryService();
  private feeService = new FeeService();
  constructor(option: BuildPayrollEmployeeOption) {
    this.employee = option.employee;
    this.options = option;
    this.payrollEmployee = {
      employeeId: this.employee.id,
      employeeSnapshot: this.employee,
      breakdown: [],
      addons: [],
      repayments: [],
      base: this.employee.base,
      net: this.employee.base,
      totalBonus: 0,
      totalDeductions: 0,
      totalCharge: 0,
      totalFee: 100,
      currency: this.employee.currency,
      totalAmount: 0,
      index: this.options.index,
      isCheckedOnWorkSheet: this.employee.isCheckedOnWorkSheet,
      payrollId: this.options.payrollId,
      status: "pending",
      organizationId: this.options.organizationId,
      shifts: this.employee.pendingShifts,
      scheduledRepayments: this.employee.scheduledRepayments,
      payableRepayments: [],
      netAfterDeductions: 0,
      statutories: {} as any,
      totalPerks: 0,
      totalVariablePay: 0,
    };
  }

  build(): IPayrollEmployee {
    this.processSalaryBreakDown();
    this.processAddOns();
    this.payrollEmployee.netAfterDeductions = clone(this.payrollEmployee.net);
    this.processRepayments();
    this.processStatutories();
    this.processTotals();
    return this.payrollEmployee;
  }
  processTotals() {
    this.payrollEmployee.totalFee =
      this.feeService.getFeeService(this.options.country).calculateFee(
        this.payrollEmployee.net,
        this.options.mode
      );
    this.payrollEmployee.totalAmount = round(
      this.payrollEmployee.totalAmount +
        this.payrollEmployee.net +
        this.payrollEmployee.totalFee,
      2
    );
    this.payrollEmployee.totalCharge = round(
      this.payrollEmployee.totalCharge +
        this.payrollEmployee.net +
        this.payrollEmployee.totalFee,
      2
    );
  }
  processStatutories() {
    let statutorySettings = this.options.statutorySettings;

    let breakdown = this.options.salaryBreakDown;

    if (this.employee.payrollGroupId) {
      const group = this.options.groups[this.employee.payrollGroupId];
      if (group) {
        statutorySettings = group.statutorySettings;
        breakdown = group.salaryBreakdown;
      }
    }

    // get all the statutory types
    const statutoryTypes = Object.keys(statutorySettings).sort(
      (a, b) => {
        const aIndex = this.statutoryService
          .get(this.options.country, a as StatutoryType)
          ?.getOrder();
        const bIndex = this.statutoryService
          .get(this.options.country, b as StatutoryType)
          ?.getOrder();
        return (aIndex || 0) - (bIndex || 0);
      }
    );

    for (const statutoryType of statutoryTypes) {
      let setting = statutorySettings[statutoryType as StatutoryType];

      if (
        setting.enabled &&
        this.employee.statutorySettings?.[statutoryType as StatutoryType]
          ?.enabled
      ) {
        const statutoryResults = this.statutoryService
          .get(this.options.country, statutoryType as StatutoryType)
          ?.calculate(
            this.employee,
            this.payrollEmployee,
            setting,
            this.options.salaryBreakDown
          );
        (statutoryResults?.children || []).forEach((result) => {
          this.payrollEmployee.totalAmount = round(
            this.payrollEmployee.totalAmount + result.amount,
            2
          );
          if (result.deductFromEmployee) {
            this.payrollEmployee.net = round(
              this.payrollEmployee.net - result.amount,
              2
            );
            this.payrollEmployee.breakdown.push({
              name: result.registryName,
              amount: result.amount,
              action: EmployeeSalaryBreakDownAction.Deduct,
              type: SalaryBreakDownType.Statutory,
            });
          }
        });
        this.payrollEmployee.statutories[statutoryType as StatutoryType] =
          statutoryResults || ({} as any);
      }
    }
  }

  processSalaryBreakDown() {
    if (this.options.salaryBreakDown.length > 0) {
      // split base base on the percentages and add to payroll employee breakdown
      this.options.salaryBreakDown.forEach((b) => {
        const amount = this.payrollEmployee.base * (b.percentage / 100);
        this.payrollEmployee.breakdown.push({
          name: b.name,
          amount,
          action: EmployeeSalaryBreakDownAction.Add,
          type: SalaryBreakDownType.SalaryItem,
        });
      });
    } else {
      this.payrollEmployee.breakdown.push({
        name: "Base",
        amount: this.payrollEmployee.base,
        action: EmployeeSalaryBreakDownAction.Add,
        type: SalaryBreakDownType.SalaryItem,
      });
    }
  }

  processAddOns() {
    this.employee.salaryAddons.forEach((addOn) => {
      if (!addOn.isActive) {
        return;
      }

      if (addOn.type === AddOnType.BONUS) {
        this.payrollEmployee.totalBonus = round(
          this.payrollEmployee.totalBonus + addOn.amount,
          2
        );
        this.payrollEmployee.net = round(
          this.payrollEmployee.net + addOn.amount,
          2
        );
      } 
      else if (addOn.type === AddOnType.PERKS) {
        this.payrollEmployee.totalPerks = round(
          this.payrollEmployee.totalPerks + addOn.amount,
          2
        );
        this.payrollEmployee.net = round(
          this.payrollEmployee.net + addOn.amount,
          2
        );
      }
      else if (addOn.type === AddOnType.VARIABLE_PAY) {
        const amount = addOn.amount * (Math.abs(addOn.unit || 1));
        this.payrollEmployee.totalVariablePay = round(
          this.payrollEmployee.totalVariablePay + amount,
          2
        );
        this.payrollEmployee.net = round(
          this.payrollEmployee.net + amount,
          2
        );
      }
      else {
        if (addOn.amount > this.payrollEmployee.net) {
          return;
        }
        this.payrollEmployee.totalDeductions = round(
          this.payrollEmployee.totalDeductions + addOn.amount,
          2
        );
        this.payrollEmployee.net = round(
          this.payrollEmployee.net - addOn.amount,
          2
        );
      }
      this.payrollEmployee.breakdown.push({
        name: addOn.name,
        amount: addOn.amount,
        type:
          addOn.type === AddOnType.BONUS
            ? SalaryBreakDownType.Bonus
            : addOn.type === AddOnType.PERKS
              ? SalaryBreakDownType.Perks
              : SalaryBreakDownType.Deduction,
        action:
          [AddOnType.BONUS, AddOnType.PERKS, AddOnType.VARIABLE_PAY].includes(addOn.type)
            ? EmployeeSalaryBreakDownAction.Add
            : EmployeeSalaryBreakDownAction.Deduct,
      });
      this.payrollEmployee.addons.push(addOn);
    });
  }

  processRepayments() {
    for (const scheduleRepayment of this.employee.scheduledRepayments) {
      const { payableRepayment, isPayable, netSalaryAfterDeductions } =
        PayrollEmployeeBuilder.processScheduledRepayment(
          scheduleRepayment,
          this.payrollEmployee.netAfterDeductions
        );
      if (isPayable) {
        this.payrollEmployee.payableRepayments.push(payableRepayment!);
        // add to breakdown
        this.payrollEmployee.breakdown.push({
          name: "Loan deduction",
          amount: payableRepayment!.payableAmount,
          action: EmployeeSalaryBreakDownAction.Deduct,
          type: SalaryBreakDownType.LoanRepayment,
        });
        this.payrollEmployee.netAfterDeductions = clone(
          netSalaryAfterDeductions
        );
      }
    }
  }

  static processScheduledRepayment(
    scheduleRepayment: IRepaymentSchedule,
    netSalary: number
  ): {
    payableRepayment?: IPayrollEmployeeRepaymentSchedule;
    isPayable: boolean;
    netSalaryAfterDeductions: number;
  } {
    const amountDue = scheduleRepayment.amount - scheduleRepayment.repaidAmount;
    let netSalaryAfterDeductions = clone(netSalary);
    if (amountDue > 0 && netSalaryAfterDeductions > 0) {
      let payableAmount = amountDue;
      // check if net is enough to satisft repaymnet
      if (amountDue > netSalaryAfterDeductions) {
        payableAmount = clone(netSalaryAfterDeductions);
        netSalaryAfterDeductions = 0;
      } else {
        netSalaryAfterDeductions -= payableAmount;
      }
      return {
        payableRepayment: {
          scheduleId: scheduleRepayment.id,
          loanId: scheduleRepayment.loanId,
          payableAmount,
          organizationId: scheduleRepayment.organizationId,
          employeeId: scheduleRepayment.employeeId,
          dueAt: scheduleRepayment.dueAt,
          id: scheduleRepayment.id,
          status: IPayrollEmployeeRepaymentScheduleStatus.Pending,
          userId: scheduleRepayment.userId,
        },
        isPayable: true,
        netSalaryAfterDeductions,
      };
    }

    return { isPayable: false, netSalaryAfterDeductions };
  }
}
