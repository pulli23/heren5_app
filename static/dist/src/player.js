define(["require", "exports", "./canvas-object", "./point"], function (require, exports, canvas_object_1, point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Player extends canvas_object_1.CanvasObject {
        constructor(controller, name = "", x = 0, y = 0, radius = 5) {
            super(controller, x, y);
            this.selected = false;
            this.dragging = false;
            this.dragOffset = new point_1.Point(0, 0);
            this._radius = radius;
            this._name = name;
            navigator.geolocation.getCurrentPosition(this.setLocation.bind(this), this.locationError.bind(this));
            this._loc = 10;
        }
        get loc() {
            return this._loc;
        }
        set loc(value) {
            this._loc = value;
        }
        setLocation(position) {
            this._loc = position.coords.latitude;
        }
        locationError(failure) {
            alert(failure.message);
        }
        drawMe(ctx) {
            ctx.beginPath();
            const canvasPos = this.controller.CoordinateToPixel(this.position);
            ctx.arc(canvasPos.x, canvasPos.y, this._radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            if (this.selected) {
                ctx.fillStyle = 'white';
            }
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
            ctx.restore();
            if (this._name !== "") {
                ctx.beginPath();
                ctx.fillStyle = 'blue';
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                let draw_x = canvasPos.x;
                let draw_y = canvasPos.y + this._radius;
                const metrics = ctx.measureText(this._name);
                const text_left = draw_x - metrics.width / 2;
                const text_right = draw_x + metrics.width / 2;
                if (text_left < 0) {
                    draw_x = 0;
                    ctx.textAlign = "left";
                }
                else if (text_right > this.controller.canvasWidth) {
                    draw_x = this.controller.canvasWidth;
                    ctx.textAlign = "right";
                }
                if (draw_y > this.controller.canvasHeight) {
                    ctx.textBaseline = 'bottom';
                    draw_y = canvasPos.y - 2 * this._radius;
                }
                if (draw_y < 0) {
                    draw_y = 0;
                    ctx.textBaseline = "top";
                }
                ctx.fillText(this._name, draw_x, draw_y + this._radius - 4);
            }
        }
        get name() {
            return this._name;
        }
        set name(value) {
            this._name = value;
        }
        tick() {
            super.tick();
            if (this.dragging) {
                const p = this.controller.mousePos.add(this.dragOffset);
                this.position = p.clamp(new point_1.Point(0, 0), new point_1.Point(1, 1));
            }
        }
        mouseClick(mousePos) {
            const tp = this.controller.PixelToCoordinate(new point_1.Point(5, 5));
            if (mousePos.x >= this.x - tp.x && mousePos.x <= this.x + tp.x &&
                mousePos.y >= this.y - tp.y && mousePos.y <= this.y + tp.y) {
                this.dragging = true;
                this.dragOffset = this.position.subtract(mousePos);
                this.controller.selectedObject = this;
                return true;
            }
        }
        mouseRelease(mousePos) {
            this.dragging = false;
            return false;
        }
    }
    exports.Player = Player;
});
//# sourceMappingURL=player.js.map