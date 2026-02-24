export function rangeStop(start: number, stop: number, step = 1) {
  const length = Math.max(0, Math.ceil((stop - start) / step));
  return Array.from({ length }, (_, i) => start + i * step);
}

export function rangeCount(start: number, count: number, step = 1) {
  return Array.from({ length: count }, (_, i) => start + i * step);
}
