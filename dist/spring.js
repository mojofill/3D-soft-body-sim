"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spring = void 0;
const three_1 = require("three");
const force_1 = __importDefault(require("./force"));
const utils_1 = require("./utils");
class Spring {
    /** `k` is the spring constant, `c` is the damping constant */
    constructor(obj1, obj2, k, c, scene, render = true, name = "DEFAULT NO NAME") {
        this.obj1 = obj1;
        this.obj2 = obj2;
        this.k = k;
        this.c = c;
        this.equilibrium = Math.hypot(obj2.x - obj1.x, obj2.y - obj1.y, obj2.z - obj1.z);
        if (!render)
            return;
        this.line = new three_1.Line(new three_1.BufferGeometry().setFromPoints([obj1.position, obj2.position]), new three_1.LineBasicMaterial({ color: 0x000000 }));
        scene.add(this.line);
    }
    /** STUPID ASS WORKAROUND THAT IDGAF ABOUT ANYMORE LOL */
    addSpringToObject() {
        this.obj1.addSpring(this);
    }
    get deltaX() {
        // the formula is: F_spring = k * delta_x
        // delta_x is the abs value difference of the equilibrium length and the distance between the two objects at this current frame
        // this is the obj dist at this current frame
        const objDist = Math.hypot(this.obj2.x - this.obj1.x, this.obj2.y - this.obj1.y, this.obj2.z - this.obj1.z);
        return objDist - this.equilibrium;
    }
    /** applies spring physics to both `obj1` and `obj2` */
    applySpringPhysics(dt) {
        // CASE I: obj1 is not anchored
        if (!this.obj1.anchored) {
            // get direction to the other object
            const directionVector = new three_1.Vector3(this.obj2.x - this.obj1.x, this.obj2.y - this.obj1.y, this.obj2.z - this.obj1.z);
            // scale it down by the magnitude of force to get the spring force
            // get the normalized direction vector between obj2 and obj1
            directionVector.normalize();
            const normalizedDirectionVector = directionVector;
            const springForce = new force_1.default(this.k * this.deltaX, normalizedDirectionVector);
            // apply this spring force to obj1
            this.obj1.applyForce(springForce, dt, true);
            // now apply damping
            // referring to this video: https://youtu.be/kyQP4t_wOGI
            // first get the speed at which the spring is expanding
            // find the velocity difference (B - A)
            // i can probably make this cleaner with a method for subtracting but whatever
            const velocityDifference = new three_1.Vector3(this.obj2.v.x - this.obj1.v.x, this.obj2.v.y - this.obj1.v.y, this.obj2.v.z - this.obj1.v.z);
            // stupid fucking threejs
            const dampingDirection = (0, utils_1.safeVectorDotProduct)(normalizedDirectionVector, velocityDifference);
            // dont think i need this cuz of my vector jawn
            // const theta = (dampingDirection < 0 ? Math.PI : 0) + normalizedDirectionVector.theta; // flip theta if damping direction is negative
            // instead of that, just multiply all the vector values by -1
            if (dampingDirection < 0)
                normalizedDirectionVector.multiplyScalar(-1);
            // abs value of damping direction because we need the magnitude
            // bro stupid ass threejs making me make a _normal cuz multiplying makes the vector itself get changed which is stupid
            const dampingForce = new force_1.default((0, utils_1.safeVectorMultiplyScalar)(normalizedDirectionVector, Math.abs(dampingDirection * this.c)).length(), normalizedDirectionVector);
            this.obj1.applyForce(dampingForce, dt);
        }
        // CASE II: obj2 is not anchored
        // copied from CASE I for sake of development time (im just too lazy)
        // read comments for CASE I to understand this code
        if (!this.obj2.anchored) {
            // flippped obj1 and obj2 for the direction, everything else is the same as CASE I
            const directionVector = new three_1.Vector3(this.obj1.x - this.obj2.x, this.obj1.y - this.obj2.y, this.obj1.z - this.obj2.z);
            directionVector.normalize();
            const normalizedDirectionVector = directionVector;
            const springForce = new force_1.default(this.k * this.deltaX, normalizedDirectionVector);
            this.obj2.applyForce(springForce, dt);
            const velocityDifference = new three_1.Vector3(this.obj1.v.x - this.obj2.v.x, this.obj1.v.y - this.obj2.v.y, this.obj1.v.z - this.obj2.v.z);
            const dampingDirection = (0, utils_1.safeVectorDotProduct)(normalizedDirectionVector, velocityDifference);
            if (dampingDirection < 0)
                normalizedDirectionVector.multiplyScalar(-1);
            const dampingForce = new force_1.default((0, utils_1.safeVectorMultiplyScalar)(normalizedDirectionVector, Math.abs(dampingDirection * this.c)).length(), normalizedDirectionVector);
            this.obj2.applyForce(dampingForce, dt);
        }
        // CASE III: both are not anchored. wait this is actually already taken care of. all good i dont need to make anymore spaghetti code
        // update the line position of this spring
        if (this.line)
            this.line.geometry.setFromPoints([this.obj1.position, this.obj2.position]);
    }
}
exports.Spring = Spring;
