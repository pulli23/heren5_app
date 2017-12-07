import {Point} from "./point";

export interface IPlayerData {
  name: string;
  position: Point;
}

export class PlayerData  implements IPlayerData{
  public static create_from_json(json: string): PlayerData {
    const obj = JSON.parse(json);
    return obj as PlayerData;
  }

  public name: string;
  public position: Point;

  constructor(name: string, position: Point) {
    this.name = name;
    this.position = position;
  }

  public to_json(): string {
    return JSON.stringify(this);
  }
}
