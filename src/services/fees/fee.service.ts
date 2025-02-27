// create a fee service that will be used to calculate the fee for a given amount
// the fee service has a private map that registers the country specific fee services against the country code
import { SupportedCountry } from "../../types";
import { IFee } from "./interface";
import { KeFeeService } from "./ke.fee.service";
import { NgFeeService } from "./ng.fee.service";
import { SzFeeService } from "./sz.fee.service";
import { TzFeeService } from "./tz.service";
import { UgFeeService } from "./ug.fee.service";

export class FeeService {
  private feeServices: Record<string, IFee> = {};

  // register the fee service for a given country in the constructor
  constructor() {
    this.feeServices = {
      [SupportedCountry.Nigeria]: new NgFeeService(),
      [SupportedCountry.Uganda]: new UgFeeService(),
      [SupportedCountry.Eswatini]: new SzFeeService(),
      [SupportedCountry.Tanzania]: new TzFeeService(),
      [SupportedCountry.Kenya]: new KeFeeService(),
    };
  }

  getFeeService(country: SupportedCountry): IFee {
    const feeService = this.feeServices[country];
    if (!feeService) {
      throw new Error(`No fee service registered for country ${country}`);
    }
    return feeService;
  }
}

