export interface BrandConfig {
  appName: string;
  brandName: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
  logoUrl?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export class WhiteLabelManager {
  private config: BrandConfig = {
    appName: 'RMS POS Terminal',
    brandName: 'Standard Brand',
    colors: {
      primary: '#0284c7',
      accent: '#f59e0b',
      background: '#f8fafc',
    },
    receiptHeader: 'Welcome to our Restaurant!',
    receiptFooter: 'Thank you! Please visit again.',
  };

  public getConfig(): BrandConfig {
    return this.config;
  }

  public updateBranding(updates: Partial<BrandConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      colors: {
        ...this.config.colors,
        ...updates.colors,
      },
    };
  }
}

export const whiteLabelManager = new WhiteLabelManager();
export default whiteLabelManager;
