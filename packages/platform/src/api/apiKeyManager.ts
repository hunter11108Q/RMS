import crypto from 'crypto';

export interface ApiKeyDetails {
  keyId: string;
  name: string;
  hashedKey: string;
  rateLimitTps: number;
}

export class ApiKeyManager {
  public static generateApiKey(name: string, rateLimitTps = 10): { rawKey: string; keyDetails: ApiKeyDetails } {
    const rawKey = `rms_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
    
    // Hash key with SHA-256 for secure db storage
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    return {
      rawKey,
      keyDetails: {
        keyId,
        name,
        hashedKey,
        rateLimitTps,
      },
    };
  }

  public static verifyKey(rawKey: string, hashedDbKey: string): boolean {
    const hashedCheck = crypto.createHash('sha256').update(rawKey).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hashedCheck), Buffer.from(hashedDbKey));
  }
}
export default ApiKeyManager;
