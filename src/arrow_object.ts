import {CanvasObject} from "./canvas-object";
import {CanvasController} from "./canvas-controller";

/**
 * Created by Paul on 12/8/2017.
 */

export class ArrowObject extends CanvasObject {
    private static drawFilledPolygon(ctx, shape) {
        ctx.moveTo(shape[0][0],shape[0][1]);
        for(let i=0; i < shape.length; i++) {
            ctx.lineTo(shape[i][0], shape[i][1]);
        }

        ctx.lineTo(shape[0][0],shape[0][1]);
    };

    public color: string;
    public direction: number;
    public length: number;
    public width: number;
    public arrow_length: number;
    public arrow_width: number;

    constructor(controller: CanvasController, x: number, y: number,
                length: number, width: number, direction: number,
                color: string, arrow_width = 1.75, arrow_length = 0.25) {
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

    public drawMe(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const xscale = this.controller.xScale;
        const yscale = this.controller.yScale;
        const scale = xscale < yscale ? xscale : yscale;

        ctx.translate(this.x*xscale, this.y*yscale);
        ctx.scale(scale, scale);
        ctx.rotate(this.direction);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ArrowObject.drawFilledPolygon(ctx, [
            [-this.length/2, -this.width/2],
            [(1-this.arrow_length - 0.5) * this.length, -this.width/2],
            [(1-this.arrow_length - 0.5) * this.length, -(this.arrow_width-0.5)*this.width],
            [(1 - 0.5) * this.length, 0],
            [(1-this.arrow_length - 0.5) * this.length, (this.arrow_width-0.5)*this.width],
            [(1-this.arrow_length - 0.5) * this.length, this.width/2],
            [-this.length/2, this.width/2]
        ]);
        ctx.fill();
        ctx.restore();
    }


}