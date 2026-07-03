import os from 'os';

export interface SystemHealthReport {
  timestamp: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  memory: {
    free: number;
    total: number;
    usagePct: number;
    processUsageMb: number;
  };
  cpu: {
    cores: number;
    loadAverage: number[];
  };
  disk: {
    status: string;
  };
}

export class HealthMonitor {
  public static getReport(): SystemHealthReport {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usagePct = ((totalMem - freeMem) / totalMem) * 100;
    
    // Process memory usage (resident set size in MB)
    const procUsageMb = process.memoryUsage().rss / (1024 * 1024);

    const status = usagePct > 90 || procUsageMb > 1024 ? 'CRITICAL' : usagePct > 75 ? 'DEGRADED' : 'HEALTHY';

    return {
      timestamp: new Date().toISOString(),
      status,
      memory: {
        free: freeMem,
        total: totalMem,
        usagePct,
        processUsageMb: Math.round(procUsageMb),
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      disk: {
        status: 'OK',
      },
    };
  }
}
export default HealthMonitor;
