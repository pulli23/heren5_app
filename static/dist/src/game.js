var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-framework", "./my-custom-events-handler", "./canvas-controller", "./app", "./arrow_object", "./target"], function (require, exports, aurelia_framework_1, my_custom_events_handler_1, canvas_controller_1, app_1, arrow_object_1, target_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findClosestAncestorByClass(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls)) { }
        return el;
    }
    let Game = Game_1 = class Game {
        constructor(app) {
            this.PlayerType = "Jager";
            this.ExtraInfo = "";
            this.myBearing = 0;
            this._myGroupName = "Geef naam";
            this.default_width = 200;
            this.default_height = 200;
            this.initialize();
            this.nextRequestTimer = null;
            this._gpsworking = false;
            navigator.geolocation.watchPosition(this.updateLocation.bind(this), this.errorLocation.bind(this), { enableHighAccuracy: true });
            this._myLongitude = 0;
            this._myLatitude = 0;
            this._myHeading = 0;
            this.targets = [];
            this.closest_target = null;
            this.lastRequest = 0;
            this.StartPollingData();
            this.onAttach.AddMethod((caller, t) => {
                if (!this.gameCanvas) {
                    return;
                }
                this.canvas_controller.setCanvas(this.gameCanvas);
                this.canvas_controller.setBackgroundColor("brown");
                this.north_arrow = new arrow_object_1.ArrowObject(this.canvas_controller, 0.5, 0.5, 0.4, 0.01, Math.PI * 1.5 - this.myHeading, "gray");
                this.north_arrow.visible = this.GPSWorking;
                this.target_arrow = new arrow_object_1.ArrowObject(this.canvas_controller, 0.5, 0.5, 0.3, 0.02, Math.PI * 1.5 - this.myHeading, "navy");
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
        get myGroupName() {
            return this._myGroupName;
        }
        set myGroupName(value) {
            this._myGroupName = value;
            const t = Date.now() - this.lastRequest;
            if (this.lastRequest === 0 || t > 25000) {
                this.doRequest();
            }
        }
        get GPSWorking() {
            return this._gpsworking;
        }
        set GPSWorking(value) {
            this._gpsworking = value;
            if (this.north_arrow != null) {
                this.north_arrow.visible = this._gpsworking;
            }
            if (this.target_arrow != null) {
                this.target_arrow.visible = this._gpsworking;
            }
        }
        get closest_target() {
            return this._closest_target;
        }
        set closest_target(value) {
            const old = this._closest_target;
            if (old === value) {
                return;
            }
            this._closest_target = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("closest_target", old, value));
        }
        get myHeading() {
            return this._myHeading;
        }
        set myHeading(value) {
            const old = this._myHeading;
            if (typeof value === 'string') {
                value = parseFloat(value);
            }
            if (old === value) {
                return;
            }
            this._myHeading = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("myHeading", old, value));
            console.log("setting heading");
            console.log(typeof value);
            this.north_arrow.direction = Math.PI * 1.5 - this._myHeading;
        }
        get myAccuracy() {
            return this._myAccuracy;
        }
        set myAccuracy(value) {
            const old = this._myAccuracy;
            if (typeof value === 'string') {
                value = parseFloat(value);
            }
            if (old === value) {
                return;
            }
            this._myAccuracy = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("myAccuracy", old, value));
        }
        get myLatitude() {
            return this._myLatitude;
        }
        set myLatitude(value) {
            const old = this._myLatitude;
            if (typeof value === 'string') {
                value = parseFloat(value);
            }
            if (old === value) {
                return;
            }
            this._myLatitude = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("myLatitude", old, value));
        }
        get myLongitude() {
            return this._myLongitude;
        }
        set myLongitude(value) {
            const old = this._myLongitude;
            if (typeof value === 'string') {
                value = parseFloat(value);
            }
            if (old === value) {
                return;
            }
            this._myLongitude = value;
            this.onPropertyChangedEvent.Invoke(this, new my_custom_events_handler_1.PropertyChangedEventArgs("myLongitude", old, value));
        }
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
            let params = "lat=" + encodeURIComponent(this.myLatitude.toString()) +
                "&lon=" + encodeURIComponent(this.myLongitude.toString());
            this.myRequest.send(params);
            this.lastRequest = Date.now();
        }
        reqListener() {
            const txt = this.myRequest.response;
            let obj = JSON.parse(txt);
            this.PlayerType = obj["type"];
            this.ExtraInfo = obj["extra"];
            this.targetsUpdatedCallBack(obj["targets"]);
            if (this.nextRequestTimer != null) {
                clearTimeout(this.nextRequestTimer);
                this.nextRequestTimer = null;
            }
            this.nextRequestTimer = setTimeout(this.doRequest.bind(this), 3000);
        }
        debugInterval() {
            this.myHeading += 0.1;
        }
        initialize() {
            this.onAttach = new my_custom_events_handler_1.CustomEventHandler();
            this.onDetach = new my_custom_events_handler_1.CustomEventHandler();
            this.onPropertyChangedEvent = new my_custom_events_handler_1.CustomEventHandler();
            this._isAttached = false;
            this._canvas_dimension = [0, 0];
            this.canvas_controller = new canvas_controller_1.CanvasController(60);
        }
        get max_width() {
            if (!this.mainContentContainer) {
                return undefined;
            }
            const elem = this.mainContentContainer;
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
        get max_height() {
            if (!this.mainContentContainer) {
                return undefined;
            }
            const elem = this.mainContentContainer;
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
        calculateCanvasDimensions() {
            const width = this.max_width;
            let height = this.max_height;
            return [width, height];
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
        CanvasChangedCallBack(positions, propertyChangedEventArgs) {
            switch (propertyChangedEventArgs.property_name) {
                default:
                    break;
            }
        }
        targetsUpdatedCallBack(newTargets) {
            this.targets.length = 0;
            for (let i = 0; i < newTargets.length; i += 1) {
                let t = newTargets[i];
                let p = t["pos"];
                this.targets.push(new target_1.Target(t["name"], p[0], p[1]));
            }
            this.updateTarget();
        }
        updateTargetArrow() {
            if (this.target_arrow == null) {
                return;
            }
            if (this.closest_target == null || this.myLongitude == null ||
                this.myLatitude == null) {
                this.target_arrow.visible = false;
                return;
            }
            this.target_arrow.visible = true;
            let dir = Game_1.bearing(this.myLatitude, this.myLongitude, this.closest_target.latitude, this.closest_target.longitude);
            this.myBearing = Game_1.toDeg(dir);
            console.log([Game_1.toDeg(dir),
                Game_1.distHaversine(this.myLatitude, this.myLongitude, this.closest_target.latitude, this.closest_target.longitude)]);
            let val = -this.myHeading + Math.PI * 1.5 + dir;
            this.target_arrow.direction = val;
        }
        updateLocation(position) {
            let heading = position.coords.heading;
            if (heading != null) {
                this.myHeading = Game_1.toRad(heading);
            }
            console.log(typeof this._myHeading);
            this.myLatitude = position.coords.latitude;
            this.myLongitude = position.coords.longitude;
            this.myAccuracy = position.coords.accuracy;
            this.GPSWorking = true;
        }
        errorLocation(err) {
            console.log(err.message);
        }
        updateTarget() {
            if (this.targets == null || this.targets.length === 0) {
                this.closest_target = null;
                return;
            }
            let dis = Infinity;
            let target = null;
            for (let i = this.targets.length - 1; i >= 0; i--) {
                let t = this.targets[i];
                let d = Game_1.distHaversine(this.myLatitude, this.myLongitude, t.latitude, t.longitude);
                if (d < dis) {
                    target = t;
                    dis = d;
                }
            }
            this.closest_target = target;
            console.log(this.closest_target.name);
        }
        static distHaversine(lat1, lon1, lat2, lon2) {
            const R = 6371e3;
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;
            lon1 = lon1 * Math.PI / 180;
            lon2 = lon2 * Math.PI / 180;
            const dLat = (lat2 - lat1);
            const dLon = (lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            return d;
        }
        static bearing(lat1, lon1, lat2, lon2) {
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;
            lon1 = lon1 * Math.PI / 180;
            lon2 = lon2 * Math.PI / 180;
            const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
            const bearing = Math.atan2(y, x);
            return bearing;
        }
        static toDeg(radians) {
            return radians * 180 / Math.PI;
        }
        static toRad(degrees) {
            return degrees * Math.PI / 180;
        }
    };
    Game = Game_1 = __decorate([
        aurelia_framework_1.inject(app_1.App),
        __metadata("design:paramtypes", [app_1.App])
    ], Game);
    exports.Game = Game;
    var Game_1;
});
//# sourceMappingURL=game.js.map