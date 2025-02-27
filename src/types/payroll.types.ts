import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Employee } from "./employee.types";
import { SalaryBreakDown } from "./settings.types";
import * as moment from "moment";
import { SupportedCountry, SupportedCurrency } from ".";
import { each } from "lodash";
import { IPayrollEmployee } from "./payroll_employee.types";
import { months } from "../constants/months";
import {
  StatutoryTypeObject,
  StatutoryObject,
  StatutoryType,
  StatutoryTypeSetting,
} from "./statutory.types";
export class BuildPayrollOption {
  @IsUUID()
  organizationId!: string;

  @ValidateNested({ each: true })
  @IsArray()
  employees!: Employee[];

  @ValidateNested({ each: true })
  @IsArray()
  salaryBreakDown!: SalaryBreakDown[];

  @IsIn(months)
  month!: string;

  @IsNumber()
  year: number;

  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @IsEnum(SupportedCountry)
  country: SupportedCountry;

  @IsUUID()
  @IsOptional()
  payrollId?: string;

  @IsBoolean()
  @IsOptional()
  isSalaryBreakdownEnabled?: boolean;
  @IsOptional()
  statutorySettings: Record<StatutoryType, StatutoryTypeSetting>;
  groups: Record<string, PayrollGroup>;

  @IsOptional()
  mode?: 'compute' | 'regular';
}

export class PayrollGroup {
  id: string;

  name: string;

  organizationId: string;

  salaryBreakdown: SalaryBreakDown[];

  @IsBoolean()
  isSalaryBreakdownEnabled: boolean;

  payrollBonus: PayrollBonus;

  @IsBoolean()
  isPayrollBonusEnabled: boolean;

  applySalaryBreakdownSettings: boolean;
  statutorySettings: Record<StatutoryType, StatutoryTypeSetting>;
}

export type PayrollBonus = {
  percentage: number;
  month: string;
};

export class IPayroll {
  @IsIn(months)
  month: string;

  @IsNumber()
  year: number;

  @IsUUID()
  organizationId: string;

  @IsNumber()
  totalPayrollAmount: number;

  @IsNumber()
  totalCharge: number;

  @IsNumber()
  totalFees: number;

  @IsNumber()
  totalBase: number;

  @IsNumber()
  totalDeductions: number;

  @IsNumber()
  totalBonus: number;

  @IsNumber()
  totalPerks: number;

  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @ValidateNested({ each: true })
  payrollEmployees: IPayrollEmployee[];

  @IsNumber()
  totalNet: number;

  /**
   * frontend should ignore, this list is only for single call to build payroll, it cant be used after subsequent calls to update
   */
  @ValidateNested({ each: true })
  includedPayrollEmployees: IPayrollEmployee[];

  @IsUUID()
  @IsOptional()
  id?: string;

  statutories: Record<StatutoryType, StatutoryTypeObject>;
}
