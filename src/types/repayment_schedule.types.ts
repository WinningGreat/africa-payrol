import { IsNumber } from "class-validator";

export enum IPayrollEmployeeRepaymentScheduleStatus {
  Pending = "pending",
  Paid = "paid",
}

export class IRepaymentSchedule {
  id: string;

  loanId: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  repaidAmount: number;

  status: string;

  dueAt: Date;

  employeeId: string;

  organizationId: string;

  userId: string;
}

export class IPayrollEmployeeRepaymentSchedule {
  id: string;

  scheduleId: string;

  loanId: string;

  @IsNumber()
  payableAmount: number;

  dueAt: Date;

  employeeId: string;

  organizationId: string;

  userId: string;

  status: IPayrollEmployeeRepaymentScheduleStatus;
}
