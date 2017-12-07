define(["require", "exports", "./my-custom-events-handler"], function (require, exports, my_custom_events_handler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FieldModel {
        get image() {
            return this._image;
        }
        get loaded() {
            return this._loaded;
        }
        set loaded(value) {
            if (this._loaded === value) {
                return;
            }
            this._loaded = value;
            if (value) {
                if (this.aspect_ratio === undefined) {
                    this._aspect_ratio = this.image.width / this.image.height;
                }
                this.onload.Invoke(this, true);
            }
        }
        get aspect_ratio() {
            return this._aspect_ratio;
        }
        get name() {
            return this._name;
        }
        constructor(name, image_source, aspect_ratio) {
            this._name = name;
            this._aspect_ratio = aspect_ratio;
            this.image_source = "public_data/" + image_source;
            this._image = new Image();
            this._loaded = false;
            this.onload = new my_custom_events_handler_1.CustomEventHandler();
        }
        load() {
            this.loaded = false;
            if (this.loaded) {
                return false;
            }
            this._image.addEventListener("load", () => {
                this.loaded = true;
            });
            this._image.src = this.image_source;
        }
        get_width(height) {
            return this.aspect_ratio * height;
        }
        get_height(width) {
            return width / this.aspect_ratio;
        }
    }
    exports.FieldModel = FieldModel;
});
//# sourceMappingURL=hockey-field-model.js.map