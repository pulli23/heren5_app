define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Point {
        static clampNumber(low, val, high) {
            return Math.min(Math.max(val, low), high);
        }
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        clone() {
            return new Point(this.x, this.y);
        }
        equals(other) {
            return this.x === other.x && this.y === other.y;
        }
        add(other) {
            return new Point(this.x + other.x, this.y + other.y);
        }
        negate() {
            return new Point(-this.x, -this.y);
        }
        subtract(other) {
            return new Point(this.x - other.x, this.y - other.y);
        }
        clamp(low, high) {
            return new Point(Point.clampNumber(low.x, this.x, high.x), Point.clampNumber(low.y, this.y, high.y));
        }
    }
    exports.Point = Point;
});

//# sourceMappingURL=point.js.map
