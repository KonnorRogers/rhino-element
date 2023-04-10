export type toAnonymousClass<T extends Constructor> = (klass: T) => T;
export type Constructor = new (...args: any[]) => {};
export type TypedConstructor<T> = new (...args: any[]) => T;
