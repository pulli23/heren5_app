import {CanvasController} from "./canvas-controller";
import {Point} from "./point";

export interface IDrawable {
  drawMe(ctx: CanvasRenderingContext2D, xscale: number, yscale: number);
}

export abstract class CanvasObject implements IDrawable {
  private _visible: boolean;

  public get visible(): boolean {
    return this._visible;
  }
  public set visible(value: boolean) {
    this._visible = value;
  }

  public get x(): number {
    return this.position.x;
  }
  public set x(value: number) {
    this.position.x = value;
  }
  public get y(): number {
    return this.position.y;
  }
  public set y(value: number) {
    this.position.y = value;
  }
  public position: Point;
  protected controller: CanvasController;
  constructor(controller: CanvasController, x: number, y: number) {
    this.controller = controller;
    this.position = new Point(x,y);
    this._visible = true;
  }

  public abstract drawMe(ctx: CanvasRenderingContext2D);

  public tick() {return;};

  public mouseClick(mousePosition: Point): boolean {
    return false;
  }

  public mouseRelease(mousePosition: Point): boolean {
    return false;
  }
}
