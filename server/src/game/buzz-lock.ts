// Node.js single-thread guarantees atomicity — no mutex needed beyond this flag.
let locked = false;

export function tryAcquire(): boolean {
  if (locked) return false;
  locked = true;
  return true;
}

export function release(): void {
  locked = false;
}

export function reset(): void {
  locked = false;
}
