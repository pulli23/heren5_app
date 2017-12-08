define(["require", "exports", "./point"], function (require, exports, point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasObject {
        get visible() {
            return this._visible;
        }
        set visible(value) {
            this._visible = value;
        }
        get x() {
            return this.position.x;
        }
        set x(value) {
            this.position.x = value;
        }
        get y() {
            return this.position.y;
        }
        set y(value) {
            this.position.y = value;
        }
        constructor(controller, x, y) {
            this.controller = controller;
            this.position = new point_1.Point(x, y);
            this._visible = true;
        }
        tick() { return; }
        ;
        mouseClick(mousePosition) {
            return false;
        }
        mouseRelease(mousePosition) {
            return false;
        }
    }
    exports.CanvasObject = CanvasObject;
});

//# sourceMappingURL=canvas-object.js.map
