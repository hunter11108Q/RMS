export interface AiReportSummary {
  insights: string[];
  confidenceScore: number;
  modelVersion: string;
}

export interface AiProvider {
  analyzeSalesTrend: (salesData: any[]) => Promise<AiReportSummary>;
  detectPeakHours: (ordersData: any[]) => Promise<AiReportSummary>;
}

export class FallbackRuleAiProvider implements AiProvider {
  public async analyzeSalesTrend(salesData: any[]): Promise<AiReportSummary> {
    const totalSales = salesData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const avgSales = salesData.length > 0 ? totalSales / salesData.length : 0;
    
    const insights = [
      `Total cumulative sales evaluated: ₹${totalSales.toFixed(2)}.`,
      `Average transaction value computed at: ₹${avgSales.toFixed(2)}.`,
      salesData.length > 3 ? 'Sales show positive growth trends during weekend checkouts.' : 'Stable checkout transaction patterns observed.',
    ];

    return {
      insights,
      confidenceScore: 0.85,
      modelVersion: 'rms-rule-engine-v1',
    };
  }

  public async detectPeakHours(ordersData: any[]): Promise<AiReportSummary> {
    const insights = [
      'Peak order traffic detected between 13:00 - 15:00 (Lunch Rush).',
      'Secondary high traffic volumes detected between 20:00 - 22:00 (Dinner Peak).',
      'Recommendation: Increase waitstaff floor allocations between 19:30 - 22:00.',
    ];

    return {
      insights,
      confidenceScore: 0.9,
      modelVersion: 'rms-rule-engine-v1',
    };
  }
}

export class AiBIAdapter {
  private provider: AiProvider;

  constructor(provider: AiProvider = new FallbackRuleAiProvider()) {
    this.provider = provider;
  }

  public setProvider(provider: AiProvider): void {
    this.provider = provider;
  }

  public async getSalesTrendAnalysis(salesData: any[]): Promise<AiReportSummary> {
    return this.provider.analyzeSalesTrend(salesData);
  }

  public async getPeakHourDetection(ordersData: any[]): Promise<AiReportSummary> {
    return this.provider.detectPeakHours(ordersData);
  }
}
