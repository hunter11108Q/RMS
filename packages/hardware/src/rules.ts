export interface PrintRulesConfig {
  autoPrintBill: boolean;
  autoPrintKOT: boolean;
  kotCopiesCount: number;
  billCopiesCount: number;
  silentPrint: boolean;
  manualConfirmationRequired: boolean;
}

export class PrintRulesManager {
  private config: PrintRulesConfig = {
    autoPrintBill: true,
    autoPrintKOT: true,
    kotCopiesCount: 1,
    billCopiesCount: 1,
    silentPrint: false,
    manualConfirmationRequired: false,
  };

  public getRules(): PrintRulesConfig {
    return this.config;
  }

  public updateRules(updates: Partial<PrintRulesConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
  }

  public shouldPrintKOT(): boolean {
    return this.config.autoPrintKOT;
  }

  public shouldPrintBill(): boolean {
    return this.config.autoPrintBill;
  }
}

export const printRulesManager = new PrintRulesManager();
export default printRulesManager;
