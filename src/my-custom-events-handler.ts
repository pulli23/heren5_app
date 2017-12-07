
import * as hashSet  from 'hash-set';

type function_type<T, U> = (obj: T, arg: U) => void;

class FunctionPointer<T, U> {
    private data: [(obj: T, arg: U) => void, object];
    constructor (method: (obj: T, arg: U) => void, obj: object) {
        this.data = [method, obj];
    }

    public get method(): (obj: T, arg: U) => void {
        return this.data[0];
    }

    public get obj(): object {
        return this.data[1];
    }

    public keyMethod(): string {
        return [this.method.name, this.obj.constructor.name].toString();
    }
    public equals(other: FunctionPointer<T, U>): boolean {
        return this.method.name === other.method.name;
    }
}
function keyMethod<T, U>(obj: FunctionPointer<T, U>): string {
    return obj.keyMethod();
}

export class CustomEventHandler<T, U> {
    private invoke_list: hashSet.HashSet;
    private FunctionPointSet: typeof hashSet;

    constructor() {
        this.FunctionPointSet = hashSet(keyMethod);
        this.invoke_list = new this.FunctionPointSet();
    }

    public AddMethod(method: function_type<T, U>, obj: object) {
        this.invoke_list.add(new FunctionPointer(method, obj));
    }

    public RemoveMethod(method: function_type<T, U>, obj: object): boolean {
        return this.invoke_list.delete(new FunctionPointer(method, obj));
    }

    public Invoke(caller: T, arg: U) {
        for (let fo of this.invoke_list) {
            const f = fo.method;
            (f.bind(fo.obj))(caller, arg);
        }
    }

    public Clear() {
        this.invoke_list.clear();
    }
}

export class PropertyChangedEventArgs {
    get property_name(): string {
        return this._property_name;
    }
    get old_value(): any {
        return this._old_value;
    }
    get new_value(): any {
        return this._new_value;
    }

    private _property_name: string;
    private _old_value: any;
    private _new_value: any;

    constructor(property_name: string, oldValue: any, newValue: any) {
        this._property_name = property_name;
        this._old_value = oldValue;
        this._new_value = newValue;
    }
}
