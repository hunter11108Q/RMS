export interface SmartInsight {
  id: string;
  category: 'INVENTORY' | 'PRICING' | 'SECURITY' | 'MARKETING';
  title: string;
  description: string;
  impactScore: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

export class SmartRecommendationsEngine {
  public static generateInsights(context: {
    lowStockCount: number;
    highMarginItems: Array<{ name: string; marginPct: number }>;
    unusualVoidsCount: number;
  }): SmartInsight[] {
    const insights: SmartInsight[] = [];

    // 1. Inventory Insights
    if (context.lowStockCount > 0) {
      insights.push({
        id: 'ins-inv-1',
        category: 'INVENTORY',
        title: 'Reorder Critical Ingredients',
        description: `There are ${context.lowStockCount} ingredients below their safety threshold. Refill stock to prevent menu item outages.`,
        impactScore: 'HIGH',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Pricing Insights
    context.highMarginItems.forEach((item, index) => {
      if (item.marginPct > 65) {
        insights.push({
          id: `ins-prc-${index}`,
          category: 'PRICING',
          title: `Promote High-Margin Item: ${item.name}`,
          description: `${item.name} has a strong margin profile of ${item.marginPct}%. Run targeted promotions to drive sales.`,
          impactScore: 'MEDIUM',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 3. Security Check
    if (context.unusualVoidsCount > 3) {
      insights.push({
        id: 'ins-sec-1',
        category: 'SECURITY',
        title: 'Void Check Frequency Spike',
        description: 'Unusual void check patterns detected on Terminal #2. Review cashier logs to audit compliance.',
        impactScore: 'HIGH',
        timestamp: new Date().toISOString(),
      });
    }

    return insights;
  }
}
export default SmartRecommendationsEngine;
