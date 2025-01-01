"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const force_1 = __importDefault(require("./force"));
const utils_1 = require("./utils");
class PhysicsObject {
    constructor(mass, v, objectMesh, anchored, name = "DEFAULT NO NAME") {
        this.mass = mass;
        this.v = v;
        this.objectMesh = objectMesh;
        this.anchored = anchored;
        this.name = name;
        this.bbox = new three_1.Box3(); // not all objects have a bounding box, just boxes
        this.totalForces = [];
        if (objectMesh.geometry instanceof three_1.BoxGeometry)
            this.objectMesh.geometry.computeBoundingBox();
        else if (objectMesh.geometry instanceof three_1.SphereGeometry)
            this.objectMesh.geometry.computeBoundingSphere();
        else
            throw new Error("idk what u doing but something went wrong");
    }
    get x() {
        return this.objectMesh.position.x;
    }
    get y() {
        return this.objectMesh.position.y;
    }
    get z() {
        return this.objectMesh.position.z;
    }
    get r() {
        var _a;
        return (_a = this.objectMesh.geometry.boundingSphere) === null || _a === void 0 ? void 0 : _a.radius;
    }
    get position() {
        return this.objectMesh.position;
    }
    addSpring(spring) {
        this.spring = spring;
    }
    applyForce(force, dt, debug = false) {
        // v = v + F/m * dt
        const a = (0, utils_1.safeVectorDivideScalar)(force.vector, this.mass); // stupid threejs does it so when u multiply the vector itself becomes multiplied/divided
        if (debug) {
            // if (force.magnitude === 0) console.log('YO');
        }
        if (a.y === 0)
            return;
        // if (this.name === "DEBUG") console.log("DEBUG ACCELERATION: " + a.y);
        // if (this.name === "NON BALL_ARR 1") console.log("OTHER ACCELERATION: " + a.y);
        this.v.add((0, utils_1.safeVectorMultiplyScalar)(a, dt));
    }
    applyPhysics(objects, dt) {
        // before all else, check for anchor. if anchored, then NO physics may be applied to this object
        if (this.anchored)
            return;
        // gravity is ALWAYS on
        this.applyForce(new force_1.default(this.mass * utils_1.g, new three_1.Vector3(0, -1, 0)), dt);
        // check for collisions first
        for (const obj of objects) {
            if (obj.isBox && this.isSphere) { // prolly ground detection
                if ((0, utils_1.boxAndBallCollisionDetect)(obj, this)) { // its hit the ground!
                    // just reverse y velocity and call it a day bro. "teleport" it just above the box so that it wont get clipped in
                    if (!this.radius)
                        throw new Error("this for typescript reasons. honestly, i can probably make this better, but rn i cant be bothered to figure out a way to do so.");
                    this.setY(obj.y + obj.bbox.max.y + this.radius + 0.1); // give it some allowance
                    this.v.y *= -1;
                }
            }
            else if (obj.isSphere) { } // for right now just skip it i'll see if i want to do sphere on sphere collisions
        }
        // update position
        // this.objectMesh.position.set(this.x + this.v.x * dt, this.y + this.v.y * dt, this.z + this.v.z * dt);
        this.moveByV(dt);
        // reset total forces
        this.totalForces = [];
    }
    setX(x) {
        this.objectMesh.position.x = x;
    }
    setY(y) {
        this.objectMesh.position.y = y;
    }
    setZ(z) {
        this.objectMesh.position.z = z;
    }
    setPosition(pos) {
        this.objectMesh.position.set(pos.x, pos.y, pos.z);
    }
    moveByV(dt) {
        this.objectMesh.position.add((0, utils_1.safeVectorMultiplyScalar)(this.v, dt));
    }
    get isSphere() {
        return this.objectMesh.geometry instanceof three_1.SphereGeometry;
    }
    get isBox() {
        return this.objectMesh.geometry instanceof three_1.BoxGeometry;
    }
    get radius() {
        var _a;
        return (_a = this.objectMesh.geometry.boundingSphere) === null || _a === void 0 ? void 0 : _a.radius;
    }
}
exports.default = PhysicsObject;
