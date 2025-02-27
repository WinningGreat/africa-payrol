import { SupportedCountry } from "../../types";
import { StatutorySubType, StatutoryType } from "../../types/statutory.types";
import { IStatutoryService } from "./statutories.interface";
import { NigeriaTaxService } from "./ng/nigeria.tax.service";
import { NigeriaPensionService } from "./ng/nigeria.pension.service";
import { UgandaTaxService } from "./ug/uganda.tax.service";
import { UgandaPensionService } from "./ug/uganda.pension.service";
import { UgandaLstService } from "./ug/uganda.lst.service";
import { EswatiniPensionService } from "./sz/eswatini.pension.service";
import { EswatiniTaxService } from "./sz/eswatini.tax.service";
import { TanzaniaTaxService } from "./tz/tanzania.tax.service";
import { TanzaniaPensionService } from "./tz/tanzania.pension.service";
import { KenyaTaxService } from "./ke/kenya.tax.service";
import { KenyaPensionService } from "./ke/kenya.pension.service";
import { KenyaShifService } from "./ke/kenya.shif.service";
import { KenyaHousingLevyService } from "./ke/kenya.housing_levy.service";
import { EswatiniProvidentFundService } from "./sz/eswatini.provident_fund.service";

export class StatutoryService {
  private registry: Map<
    SupportedCountry,
    Map<StatutoryType, IStatutoryService>
  > = new Map();
  constructor() {
    this._registerServices();
  }
  _registerServices() {
    const nigeriaMap = new Map<StatutoryType, IStatutoryService>();
    nigeriaMap.set(StatutoryType.Tax, new NigeriaTaxService());
    nigeriaMap.set(StatutoryType.Pension, new NigeriaPensionService());

    const ugandaMap = new Map<StatutoryType, IStatutoryService>();
    ugandaMap.set(StatutoryType.Tax, new UgandaTaxService());
    ugandaMap.set(StatutoryType.Pension, new UgandaPensionService());
    ugandaMap.set(StatutoryType.LST, new UgandaLstService());

    const eswatiniMap = new Map<StatutoryType, IStatutoryService>();
    eswatiniMap.set(StatutoryType.Pension, new EswatiniPensionService());
    eswatiniMap.set(StatutoryType.Tax, new EswatiniTaxService());
    eswatiniMap.set(StatutoryType.ProvidentFund, new EswatiniProvidentFundService());

    const tanzaniaMap = new Map<StatutoryType, IStatutoryService>();
    tanzaniaMap.set(StatutoryType.Tax, new TanzaniaTaxService());
    tanzaniaMap.set(StatutoryType.Pension, new TanzaniaPensionService());

    const kenyaMap = new Map<StatutoryType, IStatutoryService>();
    kenyaMap.set(StatutoryType.Tax, new KenyaTaxService());
    kenyaMap.set(StatutoryType.Pension, new KenyaPensionService());
    kenyaMap.set(StatutoryType.Shif, new KenyaShifService());
    kenyaMap.set(StatutoryType.HousingLevy, new KenyaHousingLevyService());

    this.registry.set(SupportedCountry.Nigeria, nigeriaMap);
    this.registry.set(SupportedCountry.Uganda, ugandaMap);
    this.registry.set(SupportedCountry.Eswatini, eswatiniMap);
    this.registry.set(SupportedCountry.Tanzania, tanzaniaMap);
    this.registry.set(SupportedCountry.Kenya, kenyaMap);
  }

  get(country: SupportedCountry, statutoryType: StatutoryType) {
    return this.registry.get(country)?.get(statutoryType);
  }
}
