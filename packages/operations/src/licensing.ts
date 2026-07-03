export interface LicenseDetails {
  licenseKey: string;
  activated: boolean;
  expiryDate: string;
  trialMode: boolean;
}

export class LicensingManager {
  private activeKey: string | null = null;
  private isTrial = true;

  public getLicenseStatus(): LicenseDetails {
    return {
      licenseKey: this.activeKey || 'FREE-TRIAL-KEY',
      activated: this.activeKey !== null,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      trialMode: this.isTrial,
    };
  }

  public activateLicense(key: string): boolean {
    // Basic formatting activation checks
    if (key && key.startsWith('RMS-') && key.length === 20) {
      this.activeKey = key;
      this.isTrial = false;
      return true;
    }
    return false;
  }
}
export default LicensingManager;
