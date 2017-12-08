var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-framework", "./hockey-field-model", "./my-custom-events-handler", "./canvas-controller", "./player", "./app"], function (require, exports, aurelia_framework_1, hockey_field_model_1, my_custom_events_handler_1, canvas_controller_1, player_1, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findClosestAncestorByClass(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls)) { }
        return el;
    }
    let Positions = class Positions {
        constructor(app) {
            this.heading = "opstelling komende wedstrijden";
            this.default_width = 200;
            this.default_height = 200;
            this.default_field_name = "field hockey";
            if (app == null || app.positionVM == null) {
                this.initialize();
                app.positionVM = this;
            }
            else {
                this.initalizeFromOther(app.positionVM);
                app.positionVM = this;
            }
            this.onAttach.AddMethod((caller, t) => {
                if (!this.fieldCanvas) {
                    return;
                }
                this.canvas_controller.setCanvas(this.fieldCanvas);
                this.canvas_controller.draw();
            }, this);
            this.onDetach.AddMethod((caller, t) => {
            }, this);
            this.onPropertyChangedEvent.AddMethod(this.PropertyChangedCallBack, this);
            this.canvas_controller.onPropertyChangedEvent.AddMethod(this.CanvasChangedCallBack, this);
        }
        initialize() {
            this.fieldnames = [];
            this.onAttach = new my_custom_events_handler_1.CustomEventHandler();
            this.onDetach = new my_custom_events_handler_1.CustomEventHandler();
            this.onPropertyChangedEvent = new my_custom_events_handler_1.CustomEventHandler();
            this.all_fields = new Map();
            this.loaded_fields = new Map();
            this._selected_field_idx = null;
            this._isAttached = false;
            this._canvas_dimension = [0, 0];
            this._playerCount = 0;
            this._editablePlayer = null;
            this.canvas_controller = new canvas_controller_1.CanvasController(60);
            let thefield = new hockey_field_model_1.FieldModel("field hockey", "field-hockey.png", undefined);
            this.all_fields.set(thefield.name, thefield);
            thefield = new hockey_field_model_1.FieldModel("sq hockey", "field-hockey.png", 1);
            this.all_fields.set(thefield.name, thefield);
            for (let f of this.all_fields) {
                f[1].onload.AddMethod(this.firstTimeLoading, this);
                f[1].load();
            }
        }
        initalizeFromOther(other) {
            this.fieldnames = other.fieldnames;
            this.onAttach = new my_custom_events_handler_1.CustomEventHandler();
            this.onDetach = new my_custom_events_handler_1.CustomEventHandler();
            this.onPropertyChangedEvent = new my_custom_events_handler_1.CustomEventHandler();
            this.all_fields = other.all_fields;
            this.loaded_fields = other.loaded_fields;
            this._selected_field_idx = other.selected_field_idx;
            this._isAttached = other.isAttached;
            this.canvas_controller = other.canvas_controller;
            this._canvas_dimension = other._canvas_dimension;
            this._playerCount = other.playerCount;
            this._editablePlayer = other.editablePlayer;
        }
        get editablePlayerName() {
            if (!this._editablePlayer) {
                return "";
            }
            return this._editablePlayer.name;
        }
        set editablePlayerName(value) {
            if (this._editablePlayer) {
                this._editablePlayer.name = value;
            }
        }
        get editablePlayerLocation() {
            if (!this._editablePlayer) {
                return -1;
            }
            return this._editablePlayer.loc;
        }
        set editablePlayerLocation(value) {
            if (this._editablePlayer) {
                this._editablePlayer.loc = value;
            }
        }
        get editablePlayer() {
            return this._editablePlayer;
        }
        set editablePlayer(value) {
            this._editablePlayer = value;
        }
        get selected_field_idx() {
            return this._selected_field_idx;
        }
        set selected_field_idx(value) {
            const old = this._selected_field_idx;
            if (value === old) {
                return;
            }
            this._selected_field_idx = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("selected_field_idx", old, value));
        }
        get selected_field() {
            const idx = this.selected_field_idx;
            if (idx === null) {
                return undefined;
            }
            return this.loaded_fields.get(idx);
        }
        get selected_aspect_ratio() {
            const field = this.selected_field;
            if (!field) {
                return undefined;
            }
            return field.aspect_ratio;
        }
        get max_width() {
            if (!this.mainContentContainer) {
                return undefined;
            }
            let style = window.getComputedStyle(this.mainContentContainer, null);
            const paddingLeft = parseFloat(style.paddingLeft);
            const paddingRight = parseFloat(style.paddingLeft);
            style = window.getComputedStyle(this.fieldCanvas, null);
            const marginLeft = parseFloat(style.marginLeft);
            const marginRight = parseFloat(style.marginRight);
            return this.mainContentContainer.clientWidth - paddingLeft - paddingRight - marginLeft - marginRight;
        }
        get max_height() {
            if (!this.mainContentContainer) {
                return undefined;
            }
            const elem = this.mainContentContainer;
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
        get canvas_width() {
            return this.canvas_dimension[0];
        }
        set canvas_width(value) {
            this.canvas_dimension = [value, this.canvas_dimension[1]];
        }
        get canvas_height() {
            return this.canvas_dimension[1];
        }
        set canvas_height(value) {
            this.canvas_dimension = [this.canvas_dimension[0], value];
        }
        get isAttached() {
            return this._isAttached;
        }
        set isAttached(value) {
            this._isAttached = value;
        }
        get canvas_dimension() {
            const calc_dim = this.calculateCanvasDimensions();
            if (calc_dim[0] !== this._canvas_dimension[0] || calc_dim[1] !== this._canvas_dimension[1]) {
                this.canvas_dimension = calc_dim;
            }
            return this._canvas_dimension;
        }
        set canvas_dimension(value) {
            const old = this._canvas_dimension;
            if (old[0] === value[0] && old[1] === value[1]) {
                return;
            }
            this._canvas_dimension = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("canvas_dimension", old, value));
        }
        get playerCount() {
            return this._playerCount;
        }
        set playerCount(value) {
            let tval;
            if (typeof value === "string") {
                if (value === "") {
                    tval = 0;
                }
                else {
                    tval = parseInt(value, 10);
                }
            }
            else {
                tval = value;
            }
            tval = Math.max(Math.floor(tval), 0);
            const old = this._playerCount;
            if (value === old) {
                return;
            }
            this._playerCount = tval;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("playerCount", old, tval));
        }
        calculateCanvasDimensions() {
            const field = this.selected_field;
            if (!(field && this._isAttached && field.aspect_ratio)) {
                return [this.default_width, this.default_height];
            }
            const max_width = this.max_width;
            let height = this.max_height;
            let width = field.get_width(height);
            if (width > max_width) {
                width = max_width;
                height = field.get_height(width);
            }
            return [width, height];
        }
        firstTimeLoading(theField, loaded) {
            this.loaded_fields.set(theField.name, theField);
            this.fieldnames.push(theField.name);
            for (let f of this.all_fields) {
                if (!f[1].loaded) {
                    return;
                }
            }
            this.allLoaded();
        }
        allLoaded() {
            this.selected_field_idx = this.default_field_name;
        }
        attached() {
            this._isAttached = true;
            this.onAttach.Invoke(this, false);
        }
        detached() {
            this._isAttached = false;
            this.onDetach.Invoke(this, false);
        }
        PropertyChangedCallBack(positions, propertyChangedEventArgs) {
            switch (propertyChangedEventArgs.property_name) {
                case "selected_field_idx":
                    this.canvas_controller.setBackground(this.selected_field.image);
                    break;
                case "canvas_dimension":
                    break;
                case "playerCount":
                    const l = this.canvas_controller.getObjectsOfType(player_1.Player);
                    if (propertyChangedEventArgs.new_value > l.length) {
                        for (let i = Math.floor(propertyChangedEventArgs.new_value - l.length); i > 0; i -= 1) {
                            this.canvas_controller.createNewPlayer();
                        }
                    }
                    else if (propertyChangedEventArgs.new_value < l.length) {
                        const N = l.length - propertyChangedEventArgs.new_value;
                        this.canvas_controller.removePlayers(N);
                    }
                    break;
                default:
                    return;
            }
        }
        CanvasChangedCallBack(positions, propertyChangedEventArgs) {
            switch (propertyChangedEventArgs.property_name) {
                case "selectedObject":
                    this.editablePlayer = propertyChangedEventArgs.new_value;
                    break;
                default:
                    break;
            }
        }
    };
    Positions = __decorate([
        aurelia_framework_1.inject(app_1.App),
        __metadata("design:paramtypes", [app_1.App])
    ], Positions);
    exports.Positions = Positions;
});
//# sourceMappingURL=positions.js.map