define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlayerData {
        static create_from_json(json) {
            const obj = JSON.parse(json);
            return obj;
        }
        constructor(name, position) {
            this.name = name;
            this.position = position;
        }
        to_json() {
            return JSON.stringify(this);
        }
    }
    exports.PlayerData = PlayerData;
});

//# sourceMappingURL=player-data.js.map
