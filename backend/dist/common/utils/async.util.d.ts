export declare function asyncWrapper<T>(promise: Promise<T>): Promise<[Error | null, T | null]>;
export declare function asyncThrow<T>(promise: Promise<T>): Promise<T>;
