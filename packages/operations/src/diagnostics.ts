import dns from 'dns';

export interface DiagnosticsReport {
  timestamp: string;
  dnsLookup: boolean;
  networkLatencyMs: number;
  dbConnection: boolean;
}

export class DiagnosticsCenter {
  public static async runDiagnostics(dbPing: () => Promise<boolean>): Promise<DiagnosticsReport> {
    const startTime = Date.now();
    let dnsLookup = false;
    let networkLatencyMs = 999;
    
    try {
      await new Promise<void>((resolve, reject) => {
        dns.lookup('google.com', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      dnsLookup = true;
      networkLatencyMs = Date.now() - startTime;
    } catch {
      dnsLookup = false;
    }

    let dbConnection = false;
    try {
      dbConnection = await dbPing();
    } catch {
      dbConnection = false;
    }

    return {
      timestamp: new Date().toISOString(),
      dnsLookup,
      networkLatencyMs,
      dbConnection,
    };
  }
}
export default DiagnosticsCenter;
