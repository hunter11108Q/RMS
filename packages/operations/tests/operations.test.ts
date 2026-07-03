import { DatabaseBackupManager } from '../src/backup';
import { DatabaseRestoreManager } from '../src/restore';
import { CentralLogger } from '../src/logging';
import { HealthMonitor } from '../src/monitoring';
import { DiagnosticsCenter } from '../src/diagnostics';
import { LicensingManager } from '../src/licensing';
import fs from 'fs';
import path from 'path';

describe('Production Operations Package Tests Suite', () => {
  const tempDir = path.join(__dirname, 'temp-logs-test');
  const sourceDb = path.join(tempDir, 'source.db');
  const backupDb = path.join(tempDir, 'backup.bak');
  const restoredDb = path.join(tempDir, 'restored.db');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(sourceDb, 'RMS SQLite Mock Database Content');
  });

  afterAll(() => {
    // Cleanup files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('should verify database compression and AES-256 encryption backup and restore cycle', async () => {
    const backupMgr = new DatabaseBackupManager('key-test-32-byte-string-key-xyz');
    const restoreMgr = new DatabaseRestoreManager('key-test-32-byte-string-key-xyz');

    // 1. Run backup
    const backupSuccess = await backupMgr.backup(sourceDb, backupDb, true);
    expect(backupSuccess).toBe(true);
    expect(fs.existsSync(backupDb)).toBe(true);

    // 2. Run restore
    const restoreSuccess = await restoreMgr.restore(backupDb, restoredDb, true);
    expect(restoreSuccess).toBe(true);
    expect(fs.existsSync(restoredDb)).toBe(true);

    const restoredData = fs.readFileSync(restoredDb, 'utf8');
    expect(restoredData).toBe('RMS SQLite Mock Database Content');
  });

  it('should verify CentralLogger writes logs with context filtering', () => {
    const logger = new CentralLogger(tempDir, 'WARN');
    logger.clearLogs();

    logger.info('This log should be filtered out');
    logger.warn('This is a test warning', 'UNIT_TEST');
    logger.error('Critical database error', 'DB_MOCK');

    const logs = logger.readLogs();
    expect(logs).toContain('WARN');
    expect(logs).toContain('Critical database error');
    expect(logs).not.toContain('filtered out');
  });

  it('should verify HealthMonitor fetches CPU and memory percentages', () => {
    const report = HealthMonitor.getReport();
    expect(report.status).toBeDefined();
    expect(report.memory.usagePct).toBeLessThanOrEqual(100);
    expect(report.cpu.cores).toBeGreaterThanOrEqual(1);
  });

  it('should verify DiagnosticsCenter reports', async () => {
    const report = await DiagnosticsCenter.runDiagnostics(async () => true);
    expect(report.dbConnection).toBe(true);
    expect(report.timestamp).toBeDefined();
  });

  it('should verify Licensing activate logic and expiry trial metrics', () => {
    const lic = new LicensingManager();
    const freeTrial = lic.getLicenseStatus();
    expect(freeTrial.trialMode).toBe(true);

    const validActivation = lic.activateLicense('RMS-12345-67890-ABCDE');
    expect(validActivation).toBe(true);
    expect(lic.getLicenseStatus().trialMode).toBe(false);
  });
});
