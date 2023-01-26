export class Events {
  constructor() {}

  private records = new Map<string, Set<any>>();

  bind(key: string, handler: any) {
    const { records } = this;
    if (!records.has(key)) {
      records.set(key, new Set<any>());
    }
    records.get(key)?.add(handler);
  }

  remove(key: string, handler: any) {
    const { records } = this;
    if (!records.has(key)) {
      return;
    }
    records.get(key)?.delete(handler);
  }

  trigger(key: string, ...args: any[]) {
    const { records } = this;
    if (!records.has(key)) {
      return;
    }
    Array.from(records.get(key) || []).forEach(handler => handler?.(...args));
  }
}

export const events = new Events();
