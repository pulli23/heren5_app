import {inject} from 'aurelia-framework';

import {FieldModel} from "./hockey-field-model";
import {CustomEventHandler, PropertyChangedEventArgs} from "./my-custom-events-handler";
import {CanvasController} from "./canvas-controller";
import {Player} from "./player";
import {App} from "./app"

function findClosestAncestorByClass(el: Element, cls: string) {
    // tslint:disable-next-line
    while ((el = el.parentElement) && !el.classList.contains(cls)) {}
    return el;
}

@inject(App)
export class Positions {
    public heading: string = "opstelling komende wedstrijden";
    private default_width: number = 200;
    private default_height: number = 200;
    private default_field_name: string = "field hockey";
    public fieldnames: Array<string>;
    public onAttach: CustomEventHandler<Positions, boolean>;
    public onDetach: CustomEventHandler<Positions, boolean>;
    public onPropertyChangedEvent: CustomEventHandler<Positions, PropertyChangedEventArgs>;

    private all_fields: Map<string, FieldModel>;
    private loaded_fields: Map<string, FieldModel>;
    private _selected_field_idx: string;
    private _isAttached: boolean;
    private mainContentContainer: HTMLDivElement;
    private wrapperContainer: HTMLDivElement;
    private fieldCanvas: HTMLCanvasElement;
    private canvas_controller: CanvasController;
    private _canvas_dimension: [number, number];
    private _playerCount: number;
    private _editablePlayer: Player;

    constructor(app?: App) {
        if (app == null || app.positionVM == null) {
            this.initialize();
            app.positionVM = this;
        } else {
            this.initalizeFromOther(app.positionVM);
            app.positionVM = this;
        }


        this.onAttach.AddMethod((caller, t) => {
            if (!this.fieldCanvas) {return;}
            this.canvas_controller.setCanvas(this.fieldCanvas);
            this.canvas_controller.draw();
        }, this);
        this.onDetach.AddMethod((caller, t) => {
            //TODO: deactivate canvas
        }, this);

        this.onPropertyChangedEvent.AddMethod(this.PropertyChangedCallBack, this);
        this.canvas_controller.onPropertyChangedEvent.AddMethod(this.CanvasChangedCallBack, this);
    }

    private initialize() {
        this.fieldnames = [];

        this.onAttach = new CustomEventHandler();
        this.onDetach = new CustomEventHandler();
        this.onPropertyChangedEvent = new CustomEventHandler();
        this.all_fields = new Map();
        this.loaded_fields = new Map();
        this._selected_field_idx = null;
        this._isAttached = false;
        this._canvas_dimension = [0,0];
        this._playerCount = 0;
        this._editablePlayer = null;
        this.canvas_controller = new CanvasController(60);


        let thefield =  new FieldModel("field hockey", "field-hockey.png", undefined);
        this.all_fields.set(thefield.name, thefield);
        thefield =  new FieldModel("sq hockey", "field-hockey.png", 1);
        this.all_fields.set(thefield.name, thefield);
        for (let f of this.all_fields) {
            f[1].onload.AddMethod(this.firstTimeLoading, this);
            f[1].load();
        }
    }
    private initalizeFromOther(other: Positions) {
        this.fieldnames = other.fieldnames;

        this.onAttach = new CustomEventHandler();
        this.onDetach = new CustomEventHandler();
        this.onPropertyChangedEvent = new CustomEventHandler();
        this.all_fields = other.all_fields;
        this.loaded_fields = other.loaded_fields;
        this._selected_field_idx = other.selected_field_idx;
        this._isAttached = other.isAttached;
        this.canvas_controller = other.canvas_controller;
        //const dim = other.canvas_dimension;
        this._canvas_dimension = other._canvas_dimension;
        this._playerCount = <number>other.playerCount;
        this._editablePlayer = other.editablePlayer;
    }

    get editablePlayerName(): string {
        if (!this._editablePlayer) {return "";}
        return this._editablePlayer.name;
    }
    set editablePlayerName(value: string) {
        if (this._editablePlayer) {
            this._editablePlayer.name = value;
        }
    }


    get editablePlayerLocation(): number {
        if (!this._editablePlayer) {return -1;}
        return this._editablePlayer.loc;
    }
    set editablePlayerLocation(value: number) {
        if (this._editablePlayer) {
            this._editablePlayer.loc = value;
        }
    }

    get editablePlayer(): Player {
        return this._editablePlayer;
    }
    set editablePlayer(value: Player) {
        this._editablePlayer = value;
    }
    public get selected_field_idx(): string {
        return this._selected_field_idx;
    }
    public set selected_field_idx(value: string) {
        const old = this._selected_field_idx;
        if (value === old) {return;}
        this._selected_field_idx = value;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("selected_field_idx", old, value));
    }

    private get selected_field(): FieldModel {
        const idx = this.selected_field_idx;
        if (idx === null) {return undefined;}
        return this.loaded_fields.get(idx);
    }

    public get selected_aspect_ratio(): number {
        const field = this.selected_field;
        if (!field) {return undefined;}
        return field.aspect_ratio;

    }

    public get max_width(): number {
        if (!this.mainContentContainer) {return undefined;}
        let style = window.getComputedStyle(this.mainContentContainer, null);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingLeft);
        style = window.getComputedStyle(this.fieldCanvas, null);
        const marginLeft = parseFloat(style.marginLeft);
        const marginRight = parseFloat(style.marginRight);
        return this.mainContentContainer.clientWidth - paddingLeft - paddingRight - marginLeft - marginRight;
    }

    public get max_height(): number {
        if (!this.mainContentContainer) {return undefined;}
        const elem: Element = this.mainContentContainer;
        const rect = elem.getBoundingClientRect();
        const elem2 = this.wrapperContainer;
        const elem_page_host = findClosestAncestorByClass(elem2, 'page-host');
        const sy = elem_page_host.scrollTop;
        let style = window.getComputedStyle(this.mainContentContainer, null);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        style = window.getComputedStyle(this.fieldCanvas, null);
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

    get playerCount(): number | string{
        return this._playerCount;
    }

    set playerCount(value: number | string) {
        let tval;
        if (typeof value === "string") {
            if (value === "") {
                tval = 0;
            } else {
                tval = parseInt(<string>value,10);
            }
        } else {
            tval = value;
        }
        tval = Math.max(Math.floor(tval), 0);
        const old = this._playerCount;
        if (value === old) {return;}
        this._playerCount = tval;
        this.onPropertyChangedEvent.Invoke(this, new PropertyChangedEventArgs("playerCount", old, tval));
    }

    public calculateCanvasDimensions(): [number, number] {
        const field = this.selected_field;
        if (!(field && this._isAttached && field.aspect_ratio)) {return [this.default_width, this.default_height];}
        const max_width = this.max_width;
        let height = this.max_height;
        let width = field.get_width(height);
        if (width > max_width) {
            width = max_width;
            height = field.get_height(width);
        }
        return [width, height];
    }

    public firstTimeLoading (theField: FieldModel, loaded: boolean) {
        this.loaded_fields.set(theField.name, theField);
        this.fieldnames.push(theField.name);

        for (let f of this.all_fields) {
            if (!f[1].loaded) {
                return;
            }
        }
        this.allLoaded();
    }

    public allLoaded() {
        this.selected_field_idx=this.default_field_name;
    }

    public attached() {
        this._isAttached = true;
        this.onAttach.Invoke(this, false);
    }
    public detached() {
        this._isAttached = false;
        this.onDetach.Invoke(this, false);
    }

    private PropertyChangedCallBack(positions: Positions, propertyChangedEventArgs: PropertyChangedEventArgs) {
        switch (propertyChangedEventArgs.property_name) {
            case "selected_field_idx":
                this.canvas_controller.setBackground(this.selected_field.image);
                break;
            case "canvas_dimension":
                break;
            case "playerCount":
                const l = this.canvas_controller.getObjectsOfType(Player);
                if (propertyChangedEventArgs.new_value > l.length) {
                    for (let i=Math.floor(propertyChangedEventArgs.new_value - l.length); i>0; i-=1) {
                        this.canvas_controller.createNewPlayer();
                    }
                } else if (propertyChangedEventArgs.new_value < l.length) {
                    const N = l.length - propertyChangedEventArgs.new_value;
                    this.canvas_controller.removePlayers(N);
                }
                break;
            default:
                return;
        }
    }

    private CanvasChangedCallBack(positions: Positions, propertyChangedEventArgs: PropertyChangedEventArgs) {
        switch (propertyChangedEventArgs.property_name) {
            case "selectedObject":
                this.editablePlayer = propertyChangedEventArgs.new_value;
                break;
            default:
                break;
        }
    }
}
