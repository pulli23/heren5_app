/**
 * Created by Paul on 12/7/2017.
 */
import {inject} from 'aurelia-framework';

import {CustomEventHandler, PropertyChangedEventArgs} from "./my-custom-events-handler";
import {CanvasController} from "./canvas-controller";
import {App} from "./app";
import {ArrowObject} from "./arrow_object";
import {Target} from "./target";

function findClosestAncestorByClass(el: Element, cls: string) {
    // tslint:disable-next-line
    while ((el = el.parentElement) && !el.classList.contains(cls)) {}
    return el;
}

@inject(App)
export class Game {
    get myGroupName(): string {
        return this._myGroupName;
    }

    set myGroupName(value: string) {
        this._myGroupName = value;
        const t = Date.now() - this.lastRequest;
        if (this.lastRequest === 0 || t > 25000) {
            this.doRequest();
        }
    }
    public get GPSWorking(): boolean {
        return this._gpsworking;
    }

    public set GPSWorking(value: boolean) {
        this._gpsworking = value;
        if (this.north_arrow != null) {
            this.north_arrow.visible = this._gpsworking;
        }
        if (this.target_arrow != null) {
            this.target_arrow.visible = this._gpsworking;
        }
    }
    private _gpsworking: boolean;
    get closest_target(): Target {
        return this._closest_target;
    }
    set closest_target(value: Target) {
        const old = this._closest_target;
        if (old === value) {return;}
        this._closest_target = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("closest_target", old, value));
    }

    get myHeading(): number {
        return this._myHeading;
    }
    set myHeading(value: number) {
        const old = this._myHeading;
        if (old === value) {return;}
        this._myHeading = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("myHeading", old, value));
        this.north_arrow.direction = Math.PI * 1.5 - this._myHeading;
    }

    get myAccuracy(): number {
        return this._myAccuracy;
    }
    set myAccuracy(value: number) {
        const old = this._myAccuracy;
        if (old === value) {return;}
        this._myAccuracy = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("myAccuracy", old, value));
    }

    get myLatitude(): number {
        return this._myLatitude;
    }
    set myLatitude(value: number) {
        const old = this._myLatitude;
        if (old === value) {return;}
        this._myLatitude = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("myLatitude", old, value));
    }

    get myLongitude(): number {
        return this._myLongitude;
    }
    set myLongitude(value: number) {
        const old = this._myLongitude;
        if (old === value) {return;}
        this._myLongitude = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("myLongitude", old, value));
    }

    public PlayerType: string = "Jager";
    public fieldnames: Array<string>;
    public onAttach: CustomEventHandler<Game, boolean>;
    public onDetach: CustomEventHandler<Game, boolean>;
    public onPropertyChangedEvent: CustomEventHandler<Game, PropertyChangedEventArgs>;
    public ExtraInfo: string = "";

    private _myLongitude: number;
    private _myLatitude: number;
    private _myHeading: number;
    private _myAccuracy: number;
    private lastRequest: number;

    private _myGroupName: string = "Geef naam";
    private _isAttached: boolean;
    private default_width: number = 200;
    private default_height: number = 200;
    private mainContentContainer: HTMLDivElement;
    private wrapperContainer: HTMLDivElement;
    private gameCanvas: HTMLCanvasElement;
    private canvas_controller: CanvasController;
    private _canvas_dimension: [number, number];
    private target_arrow: ArrowObject;
    private north_arrow: ArrowObject;
    private targets: Array<Target>;
    private _closest_target: Target;
    private myRequest;
    private nextRequestTimer: number;


    StartPollingData() {
        setTimeout(this.StartPollingData.bind(this), 20000);
        const t = Date.now() - this.lastRequest;
        if (this.lastRequest === 0 || t > 15000) {
            console.log("fall back, should only happen once");
            this.doRequest();
        }
    }

    doRequest() {
        this.myRequest = new XMLHttpRequest();
        let route = "/ivossenjacht/" + this._myGroupName;
        this.myRequest.addEventListener("load", this.reqListener.bind(this));
        this.myRequest.open("POST", route);
        this.myRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        let params = "lat="+encodeURIComponent(this.myLatitude.toString()) +
            "&lon="+encodeURIComponent(this.myLongitude.toString());
        this.myRequest.send(params);
        this.lastRequest = Date.now();
    }

    reqListener () {
        const txt = this.myRequest.response;
        let obj = JSON.parse(txt);
        this.PlayerType = obj["type"];
        this.ExtraInfo = obj["extra"];
        this.targetsUpdatedCallBack(obj["targets"]);
        if (this.nextRequestTimer != null) {
            clearTimeout(this.nextRequestTimer);
            this.nextRequestTimer = null;
        }
        this.nextRequestTimer = setTimeout(this.doRequest.bind(this), 3000)
    }
    constructor(app?: App) {
        this.initialize();
        this.nextRequestTimer = null;
        this._gpsworking = false;
        //navigator.geolocation.getCurrentPosition(this.setLocation.bind(this), this.locationError.bind(this));
        navigator.geolocation.watchPosition(
            this.updateLocation.bind(this),
            this.errorLocation.bind(this),
            {enableHighAccuracy: true}
        );

        this._myLongitude = 0;
        this._myLatitude = 0;
        this._myHeading = 0;
        this.targets = [];
        this.closest_target = null;
        this.lastRequest=0;
        this.StartPollingData();
        this.onAttach.AddMethod((caller, t) => {
            if (!this.gameCanvas) {return;}
            this.canvas_controller.setCanvas(this.gameCanvas);
            this.canvas_controller.setBackgroundColor("brown");
            this.north_arrow = new ArrowObject(this.canvas_controller,
                                                0.5, 0.5 , 0.4, 0.01,
                                                Math.PI * 1.5 - this.myHeading, "gray");
            this.north_arrow.visible = this.GPSWorking;
            this.target_arrow = new ArrowObject(this.canvas_controller,
                                                0.5, 0.5 , 0.3, 0.02,
                                                Math.PI * 1.5 - this.myHeading, "navy");
            this.target_arrow.visible = this.GPSWorking;
            this.canvas_controller.addObject(this.north_arrow);
            this.canvas_controller.addObject(this.target_arrow);
            this.canvas_controller.draw();
        }, this);
        this.onDetach.AddMethod((caller, t) => {
        }, this);

        this.onPropertyChangedEvent.AddMethod(this.PropertyChangedCallBack, this);
        this.canvas_controller.onPropertyChangedEvent.AddMethod(this.CanvasChangedCallBack, this);
    }

    private initialize() {
        this.onAttach = new CustomEventHandler();
        this.onDetach = new CustomEventHandler();
        this.onPropertyChangedEvent = new CustomEventHandler();
        this._isAttached = false;
        this._canvas_dimension = [0,0];
        this.canvas_controller = new CanvasController(60);
    }

    public get max_width(): number {
        if (!this.mainContentContainer) {return undefined;}
        const elem: Element = this.mainContentContainer;
        elem.setAttribute("style", "'color:#0000FF'");
        const clientWidth = this.mainContentContainer.clientWidth;
        let style = window.getComputedStyle(this.mainContentContainer, null);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingLeft);
        style = window.getComputedStyle(this.gameCanvas, null);
        const marginLeft = parseFloat(style.marginLeft);
        const marginRight = parseFloat(style.marginRight);
        return clientWidth - paddingLeft - paddingRight - marginLeft - marginRight;
    }

    public get max_height(): number {
        if (!this.mainContentContainer) {return undefined;}
        const elem: Element = this.mainContentContainer;
        const rect = elem.getBoundingClientRect();
        const elem2 = this.wrapperContainer;
        const elem_page_host = findClosestAncestorByClass(elem2, 'page-host');
        let sy = 0;
        if (elem_page_host != null) {
            sy = elem_page_host.scrollTop;
        }
        let style = window.getComputedStyle(this.mainContentContainer, null);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        style = window.getComputedStyle(this.gameCanvas, null);
        const marginTop = parseFloat(style.marginTop);
        const marginBottom = parseFloat(style.marginBottom);
        return window.innerHeight - (rect.top + sy) - paddingBottom - paddingTop - marginTop - marginBottom - 11;
    }

    public get canvas_width(): number {
        return this.canvas_dimension[0];
    }
    public set canvas_width(value: number) {
        this.canvas_dimension = [value, this.canvas_dimension[1]];
    }
    public get canvas_height(): number {
        return this.canvas_dimension[1];
    }
    public set canvas_height(value: number) {
        this.canvas_dimension = [this.canvas_dimension[0], value];
    }

    public get isAttached(): boolean {
        return this._isAttached;
    }
    public set isAttached(value: boolean) {
        this._isAttached = value;
    }

    public get canvas_dimension(): [number, number] {
        const calc_dim: [number, number] = this.calculateCanvasDimensions();
        if (calc_dim[0] !== this._canvas_dimension[0]  || calc_dim[1] !== this._canvas_dimension[1]) {
            this.canvas_dimension = calc_dim;
        }
        return this._canvas_dimension;
    }

    public set canvas_dimension(value: [number, number]) {
        const old = this._canvas_dimension;
        if (old[0] === value[0] && old[1] === value[1]) {return;}
        this._canvas_dimension = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("canvas_dimension", old, value));
    }

    public calculateCanvasDimensions(): [number, number] {
        const width = this.max_width;
        let height = this.max_height;
        return [width, height];
    }

    public attached() {
        this._isAttached = true;
        this.onAttach.Invoke(this, false);
    }
    public detached() {
        this._isAttached = false;
        this.onDetach.Invoke(this, false);
    }

    private PropertyChangedCallBack(positions: Game, propertyChangedEventArgs: PropertyChangedEventArgs) {
        switch (propertyChangedEventArgs.property_name) {
            case "canvas_dimension":
                break;
            case "myLongitude":
            case "myLatitude":
            case "closest_target":
            case "myHeading":
                this.updateTargetArrow();
            default:
                return;
        }
    }

    private CanvasChangedCallBack(positions: Game, propertyChangedEventArgs: PropertyChangedEventArgs) {
        switch (propertyChangedEventArgs.property_name) {
            default:
                break;
        }
    }

    private targetsUpdatedCallBack(newTargets) {
        this.targets.length = 0;
        for (let i = 0; i < newTargets.length; i += 1) {
            let t = newTargets[i];
            let p = t["pos"];
            this.targets.push(new Target(t["name"], p[0], p[1]));
        }
        this.updateTarget()
    }

    private updateTargetArrow() {
        if (this.target_arrow == null) {
            return;
        }
        if (this.closest_target == null || this.myLongitude == null ||
            this.myLatitude == null ) {
            this.target_arrow.visible = false;
            return;
        }
        this.target_arrow.visible = true;
        let dir = Game.bearing(this.myLatitude, this.myLongitude,
            this.closest_target.latitude, this.closest_target.longitude);
        console.log([Game.toDeg(dir),
            Game.distHaversine(this.myLatitude, this.myLongitude, this.closest_target.latitude, this.closest_target.longitude)]);
        let val = this.myHeading + Math.PI * 1.5 + dir;
        this.target_arrow.direction = val;
    }

    private updateLocation(position: Position) {
        this.myLatitude = position.coords.latitude;
        this.myLongitude = position.coords.longitude;
        this.myAccuracy = position.coords.accuracy;
        if (position.coords.heading != null) {
            this.myHeading = Game.toRad(position.coords.heading);
        }
        this.GPSWorking = true;
    }

    private errorLocation(err: PositionError) {
        console.log(err.message);
    }

    private updateTarget() {
        if (this.targets == null || this.targets.length === 0) {
            this.closest_target = null;
            return;
        }
        let dis = Infinity;
        let target: Target = null;
        for (let i = this.targets.length-1; i >= 0; i--) {
            let t = this.targets[i];
            let d = Game.distHaversine(this.myLatitude, this.myLongitude, t.latitude, t.longitude);
            if (d < dis) {
                target = t;
                dis = d;
            }
        }
        this.closest_target = target;
        console.log(this.closest_target.name);
    }

    private static distHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // earth's mean radius in m
        lat1 = lat1 * Math.PI/180;
        lat2 = lat2 * Math.PI/180;
        lon1 = lon1 * Math.PI/180;
        lon2 = lon2 * Math.PI/180;
        const dLat = (lat2 - lat1);
        const dLon = (lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        return d;
    }

    private static bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        lat1 = lat1 * Math.PI/180;
        lat2 = lat2 * Math.PI/180;
        lon1 = lon1 * Math.PI/180;
        lon2 = lon2 * Math.PI/180;
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1)*Math.sin(lat2) -
                  Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
        //console.log([lat1, lon1, lat2, lon2]);
        const bearing = Math.atan2(y, x);
        //console.log(bearing * 180/Math.PI);
        return bearing;
    }

    private static toDeg(radians: number) {
        return radians * 180/Math.PI;
    }
    private static toRad(degrees: number) {
        return degrees * Math.PI/180;
    }
}
