/**
 * Communicator is a simple event bus for type-safe event handling.
 * 
 * @template T - An object type where keys are event names and values are listener function signatures.
 * 
 * Example usage:
 * 
 * interface Events {
 *   foo: (payload: string) => void;
 *   bar: (count: number) => void;
 * }
 * 
 * const bus = new Communicator<Events>();
 * bus.on('foo', (payload) => { ... });
 * bus.emit('foo', 'hello');
 */
export class Communicator<T extends Record<string, (...args: any[]) => void>> {
    private listeners = new Map<keyof T, Set<Function>>();

    /**
     * Register an event listener for a specific event.
     * @param event - The event name.
     * @param cb - The callback function to invoke when the event is emitted.
     */
    on<K extends keyof T>(event: K, cb: T[K]) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(cb);
    }

    /**
     * Remove a previously registered event listener.
     * @param event - The event name.
     * @param cb - The callback function to remove.
     */
    off<K extends keyof T>(event: K, cb: T[K]) {
      this.listeners.get(event)?.delete(cb);
    }

    /**
     * Emit an event, calling all registered listeners with the provided data.
     * @param event - The event name.
     * @param data - The data to pass to the event listeners.
     */
    emit<K extends keyof T>(event: K, data: Parameters<T[K]>[0]) {
      this.listeners.get(event)?.forEach(cb => cb(data));
    }
}