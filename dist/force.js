"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
class Force {
    /**direction MUST be normalized */
    constructor(magnitude, direction) {
        this.magnitude = magnitude;
        this.direction = direction;
        if (Math.abs(Math.hypot(direction.x, direction.y, direction.z)) - 1 > 2 * 10 ** -5)
            throw new Error("direction is not normalized. fix it");
    }
    get x() {
        return this.magnitude * this.direction.x;
    }
    get y() {
        return this.magnitude * this.direction.y;
    }
    get z() {
        return this.magnitude * this.direction.z;
    }
    get vector() {
        return new three_1.Vector3(this.x, this.y, this.z);
    }
}
exports.default = Force;
