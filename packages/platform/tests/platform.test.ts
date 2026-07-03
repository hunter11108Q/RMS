import { AiBIAdapter, FallbackRuleAiProvider } from '../src/ai/aiProvider';
import { SmartRecommendationsEngine } from '../src/ai/recommendations';
import { PluginManager, RmsPlugin } from '../src/plugins/pluginManager';
import { ApiKeyManager } from '../src/api/apiKeyManager';
import { WebhookManager } from '../src/api/webhookManager';
import { TenantManager } from '../src/saas/tenantManager';
import { FeatureFlagsManager } from '../src/saas/featureFlags';
import { CommercialLicenseValidator } from '../src/licensing/licenseManager';
import { WhiteLabelManager } from '../src/brand/whiteLabel';
import { SecurityHardener } from '../src/security/hardening';

describe('Commercial SaaS & AI Platform Tests Suite', () => {
  it('should verify AI BI FallbackRule analyzer reports', async () => {
    const adapter = new AiBIAdapter(new FallbackRuleAiProvider());
    const salesReport = await adapter.getSalesTrendAnalysis([{ amount: 1500 }, { amount: 2000 }]);
    expect(salesReport.confidenceScore).toBe(0.85);
    expect(salesReport.insights.length).toBeGreaterThan(0);
  });

  it('should verify smart pricing and void spike alerts insights', () => {
    const insights = SmartRecommendationsEngine.generateInsights({
      lowStockCount: 4,
      highMarginItems: [{ name: 'Tomato Soup', marginPct: 75 }],
      unusualVoidsCount: 5,
    });

    expect(insights.length).toBe(3);
    expect(insights[0].category).toBe('INVENTORY');
    expect(insights[1].category).toBe('PRICING');
    expect(insights[2].category).toBe('SECURITY');
  });

  it('should verify PluginManager registers hooks lifecycle', async () => {
    const manager = new PluginManager({ db: {} });
    let loaded = false;

    const mockPlugin: RmsPlugin = {
      name: 'TestCRM',
      version: '1.0.0',
      onLoad: async (ctx) => { loaded = true; },
      onUnload: async () => { loaded = false; },
    };

    await manager.installPlugin(mockPlugin);
    expect(loaded).toBe(true);
    expect(manager.getActivePlugins()).toContain('TestCRM');

    await manager.uninstallPlugin('TestCRM');
    expect(loaded).toBe(false);
  });

  it('should generate and verify secure API key hashes', () => {
    const { rawKey, keyDetails } = ApiKeyManager.generateApiKey('Integrator Key');
    expect(rawKey.startsWith('rms_live_')).toBe(true);
    
    const isValid = ApiKeyManager.verifyKey(rawKey, keyDetails.hashedKey);
    expect(isValid).toBe(true);
  });

  it('should dispatch signed webhooks using HMAC-SHA256 signatures', async () => {
    const webhooks = new WebhookManager();
    webhooks.subscribe('http://local-webhook/endpoint', 'secret-hmac', ['OrderCreated']);

    const count = await webhooks.dispatchEvent('OrderCreated', { orderId: 99 });
    expect(count).toBe(1);
  });

  it('should verify Tenant Plan branch constraints', () => {
    const saas = new TenantManager();
    const limits = saas.checkPlanLimit('BASIC', 1);
    expect(limits.allowed).toBe(false); // 1 is already max for BASIC
  });

  it('should verify Tenant Feature Flag overrides', () => {
    const flags = new FeatureFlagsManager();
    expect(flags.isEnabled('CRM', 'tenant-1')).toBe(false); // Default is false

    flags.setTenantOverride('tenant-1', 'CRM', true);
    expect(flags.isEnabled('CRM', 'tenant-1')).toBe(true);
  });

  it('should sign and verify offline license manifests', () => {
    const manifest = {
      licenseId: 'lic-1',
      tenantId: 't-12',
      maxDevices: 10,
      expiryDate: '2028-12-31T00:00:00Z',
      features: ['ai', 'loyalty'],
    };

    const signature = CommercialLicenseValidator.generateLicenseSignature(manifest, 'secret-sig');
    const verify = CommercialLicenseValidator.verifyOfflineLicense(manifest, signature, 'secret-sig');
    expect(verify.isValid).toBe(true);
  });

  it('should customize WhiteLabel branding details', () => {
    const wl = new WhiteLabelManager();
    wl.updateBranding({ brandName: 'Pizza Palace', colors: { primary: '#FF0000', accent: '#00FF00', background: '#0000FF' } });
    expect(wl.getConfig().brandName).toBe('Pizza Palace');
    expect(wl.getConfig().colors.primary).toBe('#FF0000');
  });

  it('should sanitize input strings and mask digits', () => {
    const xssInput = '<script>alert("hack")</script>';
    expect(SecurityHardener.sanitizeInput(xssInput)).not.toContain('<script>');
    
    expect(SecurityHardener.maskSensitiveData('123456789012', 4)).toBe('********9012');
  });
});
