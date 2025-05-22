export class Communicator<T extends Record<string, (...args: any[]) => void>> {
    private listeners = new Map<keyof T, Set<Function>>();
  
    on<K extends keyof T>(event: K, cb: T[K]) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(cb);
    }
  
    off<K extends keyof T>(event: K, cb: T[K]) {
      this.listeners.get(event)?.delete(cb);
    }
  
    emit<K extends keyof T>(event: K, data: Parameters<T[K]>[0]) {
      this.listeners.get(event)?.forEach(cb => cb(data));
    }
  }
  