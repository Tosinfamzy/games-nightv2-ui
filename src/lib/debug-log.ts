/**
 * Dev-only logger for verbose socket / game event tracing. Handy while
 * developing, but this noise shouldn't ship to end users' production consoles.
 * No-ops in production builds (Vite statically replaces `import.meta.env.DEV`,
 * so the call sites tree-shake away).
 */
export const debugLog: (...args: Array<unknown>) => void = import.meta.env.DEV
  ? (...args) => console.log(...args)
  : () => {}
