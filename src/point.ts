export class Point {
  private static clampNumber(low: number, val: number, high: number): number {
    return Math.min(Math.max(val, low), high);
  }

  public x: number;
  public y: number;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  public clone(): Point {
    return new Point(this.x, this.y);
  }
  public equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }
  public add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }
  public negate(): Point {
    return new Point(-this.x, -this.y);
  }
  public subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }
  public clamp(low: Point, high: Point): Point {
    return new Point(Point.clampNumber(low.x, this.x, high.x), Point.clampNumber(low.y, this.y, high.y));
  }
}
