import crypto from 'crypto';

export interface LicenseManifest {
  licenseId: string;
  tenantId: string;
  maxDevices: number;
  expiryDate: string;
  features: string[];
}

export class CommercialLicenseValidator {
  private static gracePeriodMs = 7 * 24 * 60 * 60 * 1000; // 7 days grace

  public static generateLicenseSignature(manifest: LicenseManifest, serverPrivateSecret: string): string {
    const dataStr = JSON.stringify(manifest);
    return crypto.createHmac('sha256', serverPrivateSecret).update(dataStr).digest('hex');
  }

  public static verifyOfflineLicense(
    manifest: LicenseManifest,
    signature: string,
    serverPublicSecret: string
  ): { isValid: boolean; error?: string } {
    // 1. Verify cryptographic sign signature
    const computed = crypto.createHmac('sha256', serverPublicSecret).update(JSON.stringify(manifest)).digest('hex');
    const signatureMatch = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    
    if (!signatureMatch) {
      return { isValid: false, error: 'Invalid license signature. File may be modified.' };
    }

    // 2. Expiry check
    const now = Date.now();
    const expiry = new Date(manifest.expiryDate).getTime();
    if (now > expiry) {
      const graceEnd = expiry + this.gracePeriodMs;
      if (now > graceEnd) {
        return { isValid: false, error: 'License expired and grace period has elapsed. Activation required.' };
      }
      return { isValid: true, error: 'License expired. Operating in grace period.' };
    }

    return { isValid: true };
  }
}
export default CommercialLicenseValidator;
