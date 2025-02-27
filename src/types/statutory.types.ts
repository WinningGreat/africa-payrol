import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export enum StatutoryType {
  Tax = "tax",
  Pension = "pension",

  LST = "lst",

  Shif = "shif",

  HousingLevy = "housing-levy",

  ProvidentFund = "provident-fund",
}

export class StatutoryTypeSetting {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  employerCode?: string;

  @IsString()
  @IsOptional()
  pensionId?: string;

  pensionType?: "quote" | "deduct";

  // applies to tax
  @IsBoolean()
  @IsOptional()
  isWhtEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  whtRate?: number;

  @IsNumber()
  @IsOptional()
  employerRate?: number;


}

export enum StatutorySubType {
  EmployersPension = "employer-pension",
  EmployeePension = "employee-pension",
  VoluntaryPension = "voluntary-pension",
  Tax = "tax",

  LST = "lst",

  Shif = "shif",

  HousingLevy = "housing-levy",

  EmployeeProvidentFund = "employee-provident-fund",
  EmployerProvidentFund = "employer-provident-fund",
}

export class StatutoryObject {
  amount: number;
  annualAmount: number;
  deductFromEmployee: boolean;
  type: StatutoryType;
  subType: StatutorySubType;
  setting: StatutoryTypeSetting;
  registryName: string;
}

export class StatutoryTypeObject {
  amount: number;
  type: StatutoryType;
  children: StatutoryObject[];
  registryName: string;
  setting?: StatutoryTypeSetting;
}

export class EmployeeStatutoryTypeSetting {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  statutoryEmployeeCode?: string;

  @IsString()
  @IsOptional()
  statutoryAdminId?: string;

  @IsString()
  @IsOptional()
  pensionType?: "quote" | "deduct";
}
