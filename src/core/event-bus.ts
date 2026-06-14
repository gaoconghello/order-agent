export class EventBus {
  private static listeners: Map<string, Function[]> = new Map();

  public static on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public static emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`[EventBus] Error in listener for event ${event}:`, e);
        }
      });
    }
  }
}
