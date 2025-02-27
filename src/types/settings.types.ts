import { IsNumber, IsString } from "class-validator";

export class SalaryBreakDown {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  percentage!: number;

  @IsString()
  name!: string;
}
