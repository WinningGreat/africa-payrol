import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Employee, PayrollSalaryAddons } from "./employee.types";
import { EmployeeSalaryBreakDown } from "./employee_salary_breakdown.types";
import { SalaryBreakDown } from "./settings.types";
import * as moment from "moment";
import { SupportedCountry, SupportedCurrency } from ".";
import { months } from "../constants/months";
import {
  IPayrollEmployeeRepaymentSchedule,
  IRepaymentSchedule,
} from "./repayment_schedule.types";
import { PayrollGroup } from "./payroll.types";
import {
  StatutoryTypeObject,
  StatutoryObject,
  StatutoryType,
  StatutoryTypeSetting,
} from "./statutory.types";

export class BuildPayrollEmployeeOption {
  @ValidateNested()
  employee: Employee;

  @ValidateNested({ each: true })
  @IsArray()
  salaryBreakDown!: SalaryBreakDown[];

  @IsIn(months)
  month!: string;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  year!: number;

  @IsInt()
  index: number;

  @IsOptional()
  @IsUUID()
  payrollId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsBoolean()
  @IsOptional()
  isSalaryBreakdownEnabled?: boolean;
  @IsOptional()
  statutorySettings: Record<StatutoryType, StatutoryTypeSetting>;
  groups: Record<string, PayrollGroup>;

  country: SupportedCountry;

  @IsOptional()
  mode?: 'compute' | 'regular';
}

export class IPayrollEmployee {
  @IsUUID()
  employeeId: string;

  employeeSnapshot: Employee;

  @ValidateNested({ each: true })
  breakdown: EmployeeSalaryBreakDown[];

  @ValidateNested({ each: true })
  addons: PayrollSalaryAddons[];

  @ValidateNested({ each: true })
  repayments: any[];

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  base: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  net: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  netAfterDeductions: number; //deductions in this case are repayments

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalBonus: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalVariablePay: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalDeductions: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalFee: number;

  @IsEnum(SupportedCurrency)
  currency!: SupportedCurrency;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalAmount: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  totalCharge: number;

  @IsInt()
  index: number;

  @IsBoolean()
  isCheckedOnWorkSheet: boolean;

  @IsString()
  status: string;

  @IsOptional()
  @IsUUID()
  payrollId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  shifts: any[];

  scheduledRepayments: IRepaymentSchedule[];

  payableRepayments: IPayrollEmployeeRepaymentSchedule[];

  statutories: Record<StatutoryType, StatutoryTypeObject>;
  totalPerks: number;
}
