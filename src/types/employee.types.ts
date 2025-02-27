import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { SupportedCurrency } from ".";
import { IsValidAccountNumberBasedOnCurrency } from "../validators/account_number_validator";
import { IRepaymentSchedule } from "./repayment_schedule.types";
import {
  EmployeeStatutoryTypeSetting,
  StatutoryObject,
  StatutoryType,
} from "./statutory.types";
export class EmployeeMeta {
  @IsString()
  @IsOptional()
  taxId: string;

  @IsUUID()
  @IsOptional()
  taxStateId: string;

  @IsString()
  @IsOptional()
  pensionId: string;

  @IsUUID()
  @IsOptional()
  pensionAdminId: string;
}

export enum EmployeeStatus {
  Active = "active",
  InActive = "inactive",
}
export enum AddOnFrequency {
  ONE_TIME = "one-time",
  RECURRING = "recurring",
}

export enum AddOnType {
  BONUS = "bonus",
  DEDUCTION = "deduction",
  PERKS = "perks",
  VARIABLE_PAY = "variable-pay",
}
export class PayrollSalaryAddons {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsEnum(AddOnFrequency)
  frequency!: AddOnFrequency;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  amount!: number;

  @IsNumber()
  @IsOptional()
  unit?: number;

  @IsEnum(AddOnType)
  type!: AddOnType;

  @IsBoolean()
  isActive!: boolean;
}

export class Employee {
  @IsUUID()
  id!: string;

  @IsString()
  @IsOptional()
  customId?: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  workEmail!: string;

  @IsPhoneNumber()
  phoneNumber!: string;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  base!: number;

  @IsEnum(SupportedCurrency)
  currency!: SupportedCurrency;

  @IsUUID()
  organizationId!: string;

  @IsValidAccountNumberBasedOnCurrency()
  accountNumber!: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsUUID()
  bankId!: string;

  @IsEnum(EmployeeStatus)
  status!: EmployeeStatus;

  @IsDate()
  @IsOptional()
  dob?: Date;

  @IsBoolean()
  isCheckedOnWorkSheet: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  salaryAddons!: PayrollSalaryAddons[];

  pendingShifts: any;

  scheduledRepayments: IRepaymentSchedule[];

  @IsOptional()
  @IsUUID()
  payrollGroupId?: string;

  @IsOptional()
  meta?: Record<string, string>;

  @IsOptional()
  statutorySettings: Record<StatutoryType, EmployeeStatutoryTypeSetting>;
}
