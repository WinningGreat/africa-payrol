import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export enum EmployeeSalaryBreakDownAction {
  Deduct = "deduct",
  Add = "add",
}

export enum SalaryBreakDownType {
  SalaryItem = "salary-item",
  Bonus = "bonus",
  Deduction = "deduction",
  Perks = "perks",
  LoanRepayment = "loan",
  Statutory = "statutory",
}

export class EmployeeSalaryBreakDown {
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  amount: number;

  @IsEnum(EmployeeSalaryBreakDownAction)
  @IsString()
  action: EmployeeSalaryBreakDownAction;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type: SalaryBreakDownType;
}
