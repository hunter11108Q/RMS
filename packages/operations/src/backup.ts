import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';

export class DatabaseBackupManager {
  private encryptionKey: Buffer; // Must be 32 bytes
  private iv: Buffer; // Must be 16 bytes

  constructor(secretKeyString = 'rms-prod-operator-secret-key-32') {
    // Generate static 32-byte key from string
    this.encryptionKey = Buffer.concat([Buffer.from(secretKeyString), Buffer.alloc(32)], 32);
    this.iv = Buffer.concat([Buffer.from('rms-initial-iv-1'), Buffer.alloc(16)], 16);
  }

  public backup(
    sourceFilePath: string,
    destinationFilePath: string,
    encrypt = true
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(sourceFilePath)) {
          throw new Error(`Source database file does not exist: ${sourceFilePath}`);
        }

        const rawData = fs.readFileSync(sourceFilePath);
        
        // 1. Compress raw database bytes
        const compressedData = zlib.gzipSync(rawData);
        let finalData = compressedData;

        // 2. Encrypt if config enables it
        if (encrypt) {
          const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.iv);
          finalData = Buffer.concat([cipher.update(compressedData), cipher.final()]);
        }

        // 3. Write backup file
        fs.writeFileSync(destinationFilePath, finalData);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }
}
export default DatabaseBackupManager;
