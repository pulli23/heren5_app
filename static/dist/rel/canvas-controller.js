define(["require", "exports", "./canvas-drawer", "./point", "./player", "./my-custom-events-handler", "./player-data"], function (require, exports, canvas_drawer_1, point_1, player_1, my_custom_events_handler_1, player_data_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CanvasController {
        constructor(rate) {
            this.onPropertyChangedEvent = new my_custom_events_handler_1.CustomEventHandler();
            this._object_list = [];
            this._mousePos = new point_1.Point(0, 0);
            this._selectedObject = null;
            this.storedPlayers = [];
            this.drawer = new canvas_drawer_1.CanvasDrawer(rate, this._object_list);
            this._desired_fps = rate;
            this._last_tick = 0;
            window.addEventListener('mousemove', this.updateMousePos.bind(this), false);
            this.ticker = window.setInterval(this.tick.bind(this), 1000 / this.desired_fps);
        }
        get xScale() {
            return this.canvasWidth;
        }
        get yScale() {
            return this.canvasHeight;
        }
        get selectedObject() {
            return this._selectedObject;
        }
        set selectedObject(value) {
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
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("selectedObject", old, this.selectedObject));
        }
        get desired_fps() {
            return this._desired_fps;
        }
        get canvas() {
            return this._canvas;
        }
        set canvas(value) {
            this._canvas = value;
            this.drawer.setCanvas(this.canvas);
        }
        get canvasWidth() {
            if (!this._canvas) {
                return 0;
            }
            return this._canvas.width;
        }
        get canvasHeight() {
            if (!this._canvas) {
                return 0;
            }
            return this._canvas.height;
        }
        getObjectsOfType(type) {
            const r = [];
            for (let o of this._object_list) {
                if (o instanceof type) {
                    r.push(o);
                }
            }
            return r;
        }
        createNewPlayer() {
            const p = new player_1.Player(this);
            const idx = this.addPlayer(p);
            let newname = "Player " + idx.toString();
            let newpos = new point_1.Point(0.5, 0.5);
            if (this.storedPlayers.length > 0) {
                const dat = this.storedPlayers.pop();
                newname = dat.name;
                newpos = dat.position;
            }
            p.name = newname;
            p.position = newpos;
        }
        setCanvas(canvas) {
            this.canvas = canvas;
            this.canvas.addEventListener('mousedown', this.mouseClick.bind(this), false);
            this.canvas.addEventListener('mouseup', this.mouseRelease.bind(this), false);
        }
        setBackgroundColor(color) {
            this.drawer.background_color = color;
        }
        setBackground(image) {
            this.drawer.background = image;
        }
        addObject(o) {
            return this._object_list.push(o);
        }
        addPlayer(p) {
            return this.addObject(p);
        }
        removePlayers(N) {
            if (N <= 0) {
                return;
            }
            const rem = this._object_list.splice(-N);
            for (let o of rem.reverse()) {
                if (o instanceof player_1.Player) {
                    const p = o;
                    this.storedPlayers.push(new player_data_1.PlayerData(p.name, p.position));
                }
            }
        }
        mouseClick() {
            this.selectedObject = null;
            for (let obj of this._object_list) {
                if (obj.mouseClick(this.mousePos)) {
                    break;
                }
            }
        }
        mouseRelease() {
            for (let obj of this._object_list) {
                if (obj.mouseRelease(this.mousePos)) {
                    break;
                }
            }
        }
        tick() {
            for (let obj of this._object_list) {
                obj.tick();
            }
        }
        CoordinateToPixel(point) {
            if (!this.canvas) {
                return point;
            }
            return new point_1.Point(point.x * this.canvas.width, point.y * this.canvas.height);
        }
        PixelToCoordinate(point) {
            if (!this.canvas) {
                return point;
            }
            return new point_1.Point(point.x / this.canvas.width, point.y / this.canvas.height);
        }
        updateMousePos(evt) {
            const canvas = this.canvas;
            if (!this.canvas) {
                return;
            }
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mousePos.x = (evt.clientX - rect.left) * scaleX / this.canvas.width;
            this.mousePos.y = (evt.clientY - rect.top) * scaleY / this.canvas.height;
        }
        get mousePos() {
            return this._mousePos;
        }
        requestDraw() {
            this.drawer.requestDraw();
        }
        draw() {
            this.drawer.draw();
        }
    }
    exports.CanvasController = CanvasController;
});

//# sourceMappingURL=canvas-controller.js.map
