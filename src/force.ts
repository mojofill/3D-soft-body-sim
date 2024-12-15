import { Vector3 } from "three";

export default class Force {
    /**direction MUST be normalized */
    constructor(public magnitude: number, public direction: Vector3) {
        if (Math.abs(Math.hypot(direction.x, direction.y, direction.z)) - 1 > 2 * 10 ** -5) throw new Error("direction is not normalized. fix it");
    }

    public get x() {
        return this.magnitude * this.direction.x;
    }

    public get y() {
        return this.magnitude * this.direction.y;
    }

    public get z() {
        return this.magnitude * this.direction.z;
    }

    public get vector() {
        return new Vector3(this.x, this.y, this.z);
    }
}