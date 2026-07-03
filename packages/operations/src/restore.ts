import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';

export class DatabaseRestoreManager {
  private encryptionKey: Buffer;
  private iv: Buffer;

  constructor(secretKeyString = 'rms-prod-operator-secret-key-32') {
    this.encryptionKey = Buffer.concat([Buffer.from(secretKeyString), Buffer.alloc(32)], 32);
    this.iv = Buffer.concat([Buffer.from('rms-initial-iv-1'), Buffer.alloc(16)], 16);
  }

  public restore(
    backupFilePath: string,
    targetFilePath: string,
    encrypted = true
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(backupFilePath)) {
          throw new Error(`Backup file does not exist: ${backupFilePath}`);
        }

        const backupData = fs.readFileSync(backupFilePath);
        let decryptedData = backupData;

        // 1. Decrypt if backup is encrypted
        if (encrypted) {
          const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, this.iv);
          decryptedData = Buffer.concat([decipher.update(backupData), decipher.final()]);
        }

        // 2. Decompress backup data
        const rawData = zlib.gunzipSync(decryptedData);

        // 3. Write target DB file
        fs.writeFileSync(targetFilePath, rawData);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }
}
export default DatabaseRestoreManager;
