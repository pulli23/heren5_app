define(["require", "exports", "hash-set"], function (require, exports, hashSet) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FunctionPointer {
        constructor(method, obj) {
            this.data = [method, obj];
        }
        get method() {
            return this.data[0];
        }
        get obj() {
            return this.data[1];
        }
        keyMethod() {
            return [this.method.name, this.obj.constructor.name].toString();
        }
        equals(other) {
            return this.method.name === other.method.name;
        }
    }
    function keyMethod(obj) {
        return obj.keyMethod();
    }
    class CustomEventHandler {
        constructor() {
            this.FunctionPointSet = hashSet(keyMethod);
            this.invoke_list = new this.FunctionPointSet();
        }
        AddMethod(method, obj) {
            this.invoke_list.add(new FunctionPointer(method, obj));
        }
        RemoveMethod(method, obj) {
            return this.invoke_list.delete(new FunctionPointer(method, obj));
        }
        Invoke(caller, arg) {
            for (let fo of this.invoke_list) {
                const f = fo.method;
                (f.bind(fo.obj))(caller, arg);
            }
        }
        Clear() {
            this.invoke_list.clear();
        }
    }
    exports.CustomEventHandler = CustomEventHandler;
    class PropertyChangedEventArgs {
        get property_name() {
            return this._property_name;
        }
        get old_value() {
            return this._old_value;
        }
        get new_value() {
            return this._new_value;
        }
        constructor(property_name, oldValue, newValue) {
            this._property_name = property_name;
            this._old_value = oldValue;
            this._new_value = newValue;
        }
    }
    exports.PropertyChangedEventArgs = PropertyChangedEventArgs;
});
//# sourceMappingURL=my-custom-events-handler.js.map