export interface TenantPlanDetails {
  planName: 'BASIC' | 'PRO' | 'ENTERPRISE';
  maxBranches: number;
  maxStorageMb: number;
  aiInsightsEnabled: boolean;
}

export class TenantManager {
  private plans: Record<TenantPlanDetails['planName'], TenantPlanDetails> = {
    BASIC: {
      planName: 'BASIC',
      maxBranches: 1,
      maxStorageMb: 100,
      aiInsightsEnabled: false,
    },
    PRO: {
      planName: 'PRO',
      maxBranches: 5,
      maxStorageMb: 1024,
      aiInsightsEnabled: true,
    },
    ENTERPRISE: {
      planName: 'ENTERPRISE',
      maxBranches: 99,
      maxStorageMb: 10240,
      aiInsightsEnabled: true,
    },
  };

  public checkPlanLimit(
    plan: TenantPlanDetails['planName'],
    currentBranchesCount: number
  ): { allowed: boolean; error?: string } {
    const limits = this.plans[plan];
    if (currentBranchesCount >= limits.maxBranches) {
      return {
        allowed: false,
        error: `Tenant branch limit reached. Max allowed branches for ${plan} is ${limits.maxBranches}. Upgrade subscription plan.`,
      };
    }
    return { allowed: true };
  }
}
export default TenantManager;
