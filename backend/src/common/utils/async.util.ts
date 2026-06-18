/**
 * Wraps a promise and returns a tuple [error, data]
 * On success: [null, data]
 * On error: [error, null]
 *
 * @param promise - The promise to wrap
 * @returns Promise<[Error | null, any]>
 */
export async function asyncWrapper<T>(
  promise: Promise<T>,
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
}

/**
 * Wraps a promise and returns the data or throws the error
 * This is just a passthrough, but can be used to ensure errors are caught
 * @param promise - The promise to wrap
 * @returns Promise<T>
 */
export async function asyncThrow<T>(promise: Promise<T>): Promise<T> {
  return promise;
}
