export interface BackgroundJob {
  name: string;
  intervalMs: number;
  run: () => Promise<void>;
}

export class BackgroundWorkerPool {
  private jobs: Map<string, { job: BackgroundJob; timerId: any }> = new Map();

  public register(job: BackgroundJob): void {
    if (this.jobs.has(job.name)) {
      this.unregister(job.name);
    }

    const runWithSafeHandler = async () => {
      try {
        await job.run();
      } catch (err: any) {
        console.error(`Background worker [${job.name}] failed:`, err.message);
      }
    };

    // Run immediately and schedule intervals
    runWithSafeHandler();
    const timerId = setInterval(runWithSafeHandler, job.intervalMs);

    this.jobs.set(job.name, { job, timerId });
  }

  public unregister(name: string): void {
    const active = this.jobs.get(name);
    if (active) {
      clearInterval(active.timerId);
      this.jobs.delete(name);
    }
  }

  public stopAll(): void {
    this.jobs.forEach((val) => {
      clearInterval(val.timerId);
    });
    this.jobs.clear();
  }

  public getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}
export default BackgroundWorkerPool;
