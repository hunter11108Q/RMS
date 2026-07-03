export type FeatureFlagName = 'INVENTORY' | 'CRM' | 'RESERVATIONS' | 'DELIVERY' | 'LOYALTY' | 'AI_INSIGHTS';

export class FeatureFlagsManager {
  private globalFlags: Record<FeatureFlagName, boolean> = {
    INVENTORY: true,
    CRM: false,
    RESERVATIONS: true,
    DELIVERY: false,
    LOYALTY: false,
    AI_INSIGHTS: true,
  };

  private tenantOverrides: Map<string, Partial<Record<FeatureFlagName, boolean>>> = new Map();

  public isEnabled(flag: FeatureFlagName, tenantId?: string): boolean {
    if (tenantId) {
      const overrides = this.tenantOverrides.get(tenantId);
      if (overrides && overrides[flag] !== undefined) {
        return overrides[flag]!;
      }
    }
    return this.globalFlags[flag];
  }

  public setTenantOverride(tenantId: string, flag: FeatureFlagName, enabled: boolean): void {
    const active = this.tenantOverrides.get(tenantId) || {};
    active[flag] = enabled;
    this.tenantOverrides.set(tenantId, active);
  }

  public clearTenantOverrides(tenantId: string): void {
    this.tenantOverrides.delete(tenantId);
  }
}

export const featureFlagsManager = new FeatureFlagsManager();
export default featureFlagsManager;
