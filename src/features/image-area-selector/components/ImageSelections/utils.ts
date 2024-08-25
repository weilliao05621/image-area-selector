export function getBoundary(
  start: number,
  end: number,
  direction: keyof Pick<Math, "min" | "max">,
) {
  return Math[direction](start, end);
}
