define(["require", "exports", "./canvas-object"], function (require, exports, canvas_object_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ArrowObject extends canvas_object_1.CanvasObject {
        static drawFilledPolygon(ctx, shape) {
            ctx.moveTo(shape[0][0], shape[0][1]);
            for (let i = 0; i < shape.length; i++) {
                ctx.lineTo(shape[i][0], shape[i][1]);
            }
            ctx.lineTo(shape[0][0], shape[0][1]);
        }
        ;
        constructor(controller, x, y, length, width, direction, color, arrow_width = 1.75, arrow_length = 0.25) {
            super(controller, x, y);
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.length = length;
            this.width = width;
            this.color = color;
            this.arrow_length = arrow_length;
            this.arrow_width = arrow_width;
        }
        drawMe(ctx) {
            ctx.save();
            const xscale = this.controller.xScale;
            const yscale = this.controller.yScale;
            const scale = xscale < yscale ? xscale : yscale;
            ctx.translate(this.x * xscale, this.y * yscale);
            ctx.scale(scale, scale);
            ctx.rotate(this.direction);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ArrowObject.drawFilledPolygon(ctx, [
                [-this.length / 2, -this.width / 2],
                [(1 - this.arrow_length - 0.5) * this.length, -this.width / 2],
                [(1 - this.arrow_length - 0.5) * this.length, -(this.arrow_width - 0.5) * this.width],
                [(1 - 0.5) * this.length, 0],
                [(1 - this.arrow_length - 0.5) * this.length, (this.arrow_width - 0.5) * this.width],
                [(1 - this.arrow_length - 0.5) * this.length, this.width / 2],
                [-this.length / 2, this.width / 2]
            ]);
            ctx.fill();
            ctx.restore();
        }
    }
    exports.ArrowObject = ArrowObject;
});
//# sourceMappingURL=arrow_object.js.map