/**
 * Created by Paul on 12/8/2017.
 */

export class Target {
    name: string;
    longitude: number;
    latitude: number;
    constructor(name: string, latitude: number, longitude: number) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

}