import {CanvasObject} from "./canvas-object";
import {CanvasController} from "./canvas-controller";
import {Point} from "./point";

export class Player extends CanvasObject {
    get loc(): number {
        return this._loc;
    }

    set loc(value: number) {
        this._loc = value;
    }
    public selected: boolean = false;
    private _radius: number;
    private _name: string;
    private dragging: boolean = false;
    private dragOffset: Point = new Point(0, 0);
    private _loc: number;

    constructor(controller: CanvasController, name: string = "", x: number = 0, y: number = 0, radius: number = 5) {
        super(controller, x, y);
        this._radius = radius;
        this._name = name;
        navigator.geolocation.getCurrentPosition(this.setLocation.bind(this), this.locationError.bind(this));
        this._loc = 10;
    }

    public setLocation(position) {
        this._loc = position.coords.latitude
    }

    public locationError(failure) {
        alert(failure.message);
    }

    public drawMe(ctx: CanvasRenderingContext2D) {
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
            const text_left = draw_x - metrics.width/2;
            const text_right = draw_x + metrics.width/2;
            if (text_left < 0) {
                draw_x = 0;
                ctx.textAlign = "left";
            } else if (text_right > this.controller.canvasWidth) {
                draw_x = this.controller.canvasWidth;
                ctx.textAlign = "right";
            }
            if (draw_y > this.controller.canvasHeight) {
                ctx.textBaseline = 'bottom';
                draw_y = canvasPos.y - 2*this._radius;
            }
            if (draw_y < 0) {
                draw_y = 0;
                ctx.textBaseline = "top";
            }
            ctx.fillText(this._name, draw_x, draw_y + this._radius - 4);
        }
    }
    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }
    public tick() {
        super.tick();
        if (this.dragging) {
            const p = this.controller.mousePos.add(this.dragOffset);
            this.position = p.clamp(new Point(0,0), new Point(1,1));
        }
    }
    public mouseClick(mousePos: Point): boolean {
        const tp = this.controller.PixelToCoordinate(new Point(5, 5));
        if (mousePos.x >= this.x-tp.x && mousePos.x <= this.x+tp.x &&
            mousePos.y >= this.y-tp.y && mousePos.y <= this.y+tp.y) {
            this.dragging = true;
            this.dragOffset = this.position.subtract(mousePos);
            this.controller.selectedObject = this;

            return true;
        }
    }

    public mouseRelease(mousePos: Point): boolean {
        this.dragging = false;
        return false;
    }
}
