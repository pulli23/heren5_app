import {CanvasObject} from './canvas-object';
export class CanvasDrawer {
  get draw_rate(): number {
    return this._draw_rate;
  }

  set draw_rate(value: number) {
    this._draw_rate = value;
    window.clearInterval(this.drawer);
    this.drawer = window.setInterval(this.requestDraw.bind(this), 1000/this.draw_rate);
  }
  private _canvas: HTMLCanvasElement;
  private _background: HTMLImageElement;
  private _last_draw: number;
  private _draw_rate: number;
  private readonly _object_list: Array<CanvasObject>;
  private drawer: number;

  constructor(draw_rate: number, object_list_reference: Array<CanvasObject>) {
    this._background = new Image();
    this._last_draw = 0;
    this._draw_rate = draw_rate;
    this._object_list = object_list_reference;
    this.drawer = window.setInterval(this.requestDraw.bind(this), 1000/this.draw_rate);

  }

  get background(): HTMLImageElement {
    return this._background;
  }
  set background(value: HTMLImageElement) {
    this._background = value;
  }
  private get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  private set canvas(value: HTMLCanvasElement) {
    this._canvas = value;
  }
  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public requestDraw() {
    const t = Date.now() - this._last_draw;
    if (t > 1000/this.draw_rate) {
      this._last_draw = Date.now();
      this.draw();
    }
  }

  public draw() {
    if (!this.canvas) {return;}
    const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
    this.drawBackground(ctx);
    this.drawObjects(ctx);
  }

  private drawObjects(ctx: CanvasRenderingContext2D) {
    for (let elem of this._object_list) {
      elem.drawMe(ctx);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this._background) {
      ctx.drawImage(this._background, 0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }

}
