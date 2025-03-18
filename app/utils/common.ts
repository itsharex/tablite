export function withRetries<T extends ((...args: any) => any)>(fn: T, times = 3) {
  const wp = (...args: any) => {
    for (let i = 0; i < times; i++) {
      try {
        return fn(...args)
      }
      catch {
        continue
      }
    }
  }

  return wp as T
}
