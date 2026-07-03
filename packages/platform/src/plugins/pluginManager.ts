export interface RmsPlugin {
  name: string;
  version: string;
  onLoad: (context: any) => Promise<void>;
  onUnload: () => Promise<void>;
}

export class PluginManager {
  private activePlugins: Map<string, RmsPlugin> = new Map();
  private hookRegistry: Map<string, Set<(...args: any[]) => void>> = new Map();
  private context: any;

  constructor(context: any) {
    this.context = context;
  }

  public async installPlugin(plugin: RmsPlugin): Promise<boolean> {
    if (this.activePlugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already active.`);
      return false;
    }

    try {
      await plugin.onLoad(this.context);
      this.activePlugins.set(plugin.name, plugin);
      console.log(`Successfully loaded plugin: ${plugin.name} (v${plugin.version})`);
      return true;
    } catch (err: any) {
      console.error(`Failed to install plugin ${plugin.name}:`, err.message);
      return false;
    }
  }

  public async uninstallPlugin(name: string): Promise<boolean> {
    const plugin = this.activePlugins.get(name);
    if (!plugin) return false;

    try {
      await plugin.onUnload();
      this.activePlugins.delete(name);
      console.log(`Successfully unloaded plugin: ${name}`);
      return true;
    } catch (err: any) {
      console.error(`Failed to uninstall plugin ${name}:`, err.message);
      return false;
    }
  }

  public registerHook(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.hookRegistry.has(event)) {
      this.hookRegistry.set(event, new Set());
    }
    this.hookRegistry.get(event)!.add(callback);

    return () => {
      const set = this.hookRegistry.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  public triggerHook(event: string, ...args: any[]): void {
    const callbacks = this.hookRegistry.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(...args);
        } catch (err: any) {
          console.error(`Plugin hook trigger error for [${event}]:`, err.message);
        }
      });
    }
  }

  public getActivePlugins(): string[] {
    return Array.from(this.activePlugins.keys());
  }
}
export default PluginManager;
