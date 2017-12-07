import {CanvasDrawer} from "./canvas-drawer";
import {CanvasObject} from "./canvas-object";
import {Point} from "./point";
import {Player} from "./player";
import {CustomEventHandler, PropertyChangedEventArgs} from "./my-custom-events-handler";
import {PlayerData} from "./player-data";

export class CanvasController {
  public onPropertyChangedEvent: CustomEventHandler<object, PropertyChangedEventArgs> = new CustomEventHandler();
  private _last_tick: number;
  private _canvas: HTMLCanvasElement;
  private readonly _object_list: Array<CanvasObject> = [];
  private _mousePos: Point = new Point(0,0);
  private _desired_fps: number;
  private drawer: CanvasDrawer;
  private ticker: number;
  private _selectedObject: Player = null;
  private storedPlayers: Array<PlayerData> = [];

  constructor(rate: number) {
    this.drawer = new CanvasDrawer(rate, this._object_list);
    this._desired_fps = rate;

    this._last_tick = 0;
    window.addEventListener('mousemove', this.updateMousePos.bind(this), false);
    this.ticker = window.setInterval(this.tick.bind(this), 1000/this.desired_fps);
  }
  get selectedObject(): Player {
    return this._selectedObject;
  }

  set selectedObject(value: Player) {
    if (this._selectedObject === value) {
      return;
    }
    let old = this._selectedObject;
    if (!!this._selectedObject) {
      this.selectedObject.selected = false;
    }
    this._selectedObject = value;
    if (!!this._selectedObject) {
      this.selectedObject.selected = true;
    }
    this.onPropertyChangedEvent.Invoke(this,
      new PropertyChangedEventArgs("selectedObject", old, this.selectedObject));
  }

  public get desired_fps(): number {
    return this._desired_fps;
  }

  private get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  private set canvas(value: HTMLCanvasElement) {
    this._canvas = value;
    this.drawer.setCanvas(this.canvas);
  }

  public get canvasWidth(): number {
    if (!this._canvas) {return 0;}
    return this._canvas.width;
  }
  public get canvasHeight(): number {
    if (!this._canvas) {return 0;}
    return this._canvas.height;
  }

  public getObjectsOfType(type: any) {
    const r = [];
    for (let o of this._object_list) {
      if (o instanceof type) {
        r.push(o);
      }
    }
    return r;
  }

  public createNewPlayer() {
    const p = new Player(this);
    const idx = this.addPlayer(p);
    let newname ="Player " + idx.toString();
    let newpos = new Point(0.5, 0.5);
    if (this.storedPlayers.length > 0) {
      const dat = this.storedPlayers.pop();
      newname = dat.name;
      newpos = dat.position;
    }
    p.name = newname;
    p.position = newpos;
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener('mousedown', this.mouseClick.bind(this), false);
    this.canvas.addEventListener('mouseup', this.mouseRelease.bind(this), false);
  }
  public setBackground(image: HTMLImageElement) {
    this.drawer.background = image;
  }

  public addPlayer(p: CanvasObject): number {
    return this._object_list.push(p);
  }
  public removePlayers(N: number) {
    if (N <= 0) {return;}
    const rem = this._object_list.splice(-N);
    for (let o of rem.reverse()) {
      if (o instanceof Player) {
        const p = o as Player;
        this.storedPlayers.push(new PlayerData(p.name, p.position));
      }
    }
  }

  public mouseClick() {
    this.selectedObject = null;
    for (let obj of this._object_list) {
      if (obj.mouseClick(this.mousePos)) {
        break;
      }
    }
  }
  public mouseRelease() {
    for (let obj of this._object_list) {
      if (obj.mouseRelease(this.mousePos)) {
      break;
      }
    }
  }

  public tick() {
    for (let obj of this._object_list) {
      obj.tick();
    }
  }

  public CoordinateToPixel(point: Point): Point {
    if (!this.canvas) {return point;}
    return new Point(point.x * this.canvas.width, point.y * this.canvas.height);
  }
  public PixelToCoordinate(point: Point): Point {
    if (!this.canvas) {return point;}
    return new Point(point.x / this.canvas.width, point.y / this.canvas.height);
  }

  public updateMousePos(evt) {
    const canvas = this.canvas;
    if (!this.canvas) {return;}
    const rect = canvas.getBoundingClientRect(); // abs. size of element
    const scaleX = canvas.width / rect.width;   // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    this.mousePos.x = (evt.clientX - rect.left) * scaleX / this.canvas.width;
    this.mousePos.y = (evt.clientY - rect.top) * scaleY / this.canvas.height;
  }

  public get mousePos(): Point {
    return this._mousePos;
  }

  public requestDraw() {
    this.drawer.requestDraw();
  }

  public draw() {
    this.drawer.draw();
  }

}
