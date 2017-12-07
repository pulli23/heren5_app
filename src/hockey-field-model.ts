import {CustomEventHandler} from "./my-custom-events-handler";


export class FieldModel {
    public get image(): HTMLImageElement {
        return this._image;
    }

    public get loaded(): boolean {
        return this._loaded;
    }

    public set loaded(value: boolean) {
        if (this._loaded === value) {return;}
        this._loaded = value;
        if (value) {
            if (this.aspect_ratio === undefined) {
                this._aspect_ratio = this.image.width/this.image.height;
            }
            this.onload.Invoke(this, true);
        }
    }

    public get aspect_ratio(): number {
        return this._aspect_ratio;
    }
    public get name(): string {
        return this._name;
    }

    public onload: CustomEventHandler<FieldModel, boolean>;
    private image_source: string;
    private _loaded: boolean;
    private _image: HTMLImageElement;
    private _name: string;
    private _aspect_ratio: number;

    constructor(name: string, image_source: string, aspect_ratio?: number) {
        this._name = name;
        this._aspect_ratio = aspect_ratio;
        this.image_source = "public_data/" + image_source;
        this._image = new Image();
        this._loaded = false;
        this.onload = new CustomEventHandler();
    }

    public load(): boolean {
        this.loaded = false;
        if (this.loaded) {
            return false;
        }
        this._image.addEventListener("load", () => {
            this.loaded = true;
        });
        this._image.src = this.image_source;
    }

    public get_width(height: number): number {
        return this.aspect_ratio * height;
    }

    public get_height(width: number): number {
        return width/this.aspect_ratio;
    }
}
