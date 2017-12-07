define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasDrawer {
        get draw_rate() {
            return this._draw_rate;
        }
        set draw_rate(value) {
            this._draw_rate = value;
            window.clearInterval(this.drawer);
            this.drawer = window.setInterval(this.requestDraw.bind(this), 1000 / this.draw_rate);
        }
        constructor(draw_rate, object_list_reference) {
            this._background = new Image();
            this._last_draw = 0;
            this._draw_rate = draw_rate;
            this._object_list = object_list_reference;
            this.drawer = window.setInterval(this.requestDraw.bind(this), 1000 / this.draw_rate);
        }
        get background() {
            return this._background;
        }
        set background(value) {
            this._background = value;
        }
        get canvas() {
            return this._canvas;
        }
        set canvas(value) {
            this._canvas = value;
        }
        setCanvas(canvas) {
            this.canvas = canvas;
        }
        requestDraw() {
            const t = Date.now() - this._last_draw;
            if (t > 1000 / this.draw_rate) {
                this._last_draw = Date.now();
                this.draw();
            }
        }
        draw() {
            if (!this.canvas) {
                return;
            }
            const ctx = this.canvas.getContext('2d');
            this.drawBackground(ctx);
            this.drawObjects(ctx);
        }
        drawObjects(ctx) {
            for (let elem of this._object_list) {
                elem.drawMe(ctx);
            }
        }
        drawBackground(ctx) {
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (this._background) {
                ctx.drawImage(this._background, 0, 0, w, h);
            }
            else {
                ctx.clearRect(0, 0, w, h);
            }
        }
    }
    exports.CanvasDrawer = CanvasDrawer;
});
//# sourceMappingURL=canvas-drawer.js.map