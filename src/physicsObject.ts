import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import Force from "./force"
import { boxAndBallCollisionDetect, g, safeVectorDivideScalar, safeVectorMultiplyScalar } from "./utils";
import { Spring } from "./spring"; // this MIGHT be circular

export default abstract class PhysicsObject {
    public bbox: Box3 = new Box3(); // not all objects have a bounding box, just boxes
    public totalForces: Force[] = [];
    public spring: Spring | undefined;
    
    constructor(
        public mass: number,
        public v: Vector3,
        public objectMesh: Mesh,
        public anchored: boolean,
        public name: string = "DEFAULT NO NAME"
    ) {
        if (objectMesh.geometry instanceof BoxGeometry) this.objectMesh.geometry.computeBoundingBox();
        else if (objectMesh.geometry instanceof SphereGeometry) this.objectMesh.geometry.computeBoundingSphere();
        else throw new Error("idk what u doing but something went wrong");
    }

    public get x() {
        return this.objectMesh.position.x;
    }

    public get y() {
        return this.objectMesh.position.y;
    }

    public get z() {
        return this.objectMesh.position.z;
    }

    public get r() : number | undefined {
        return this.objectMesh.geometry.boundingSphere?.radius;
    }

    public get position() : Vector3 {
        return this.objectMesh.position;
    }

    public addSpring(spring: Spring) {
        this.spring = spring;
    }

    public applyForce(force: Force, dt: number, debug: boolean = false) {
        // v = v + F/m * dt
        const a = safeVectorDivideScalar(force.vector, this.mass); // stupid threejs does it so when u multiply the vector itself becomes multiplied/divided
        if (debug) {
            // if (force.magnitude === 0) console.log('YO');
        }
        if (a.y === 0) return;
        // if (this.name === "DEBUG") console.log("DEBUG ACCELERATION: " + a.y);
        // if (this.name === "NON BALL_ARR 1") console.log("OTHER ACCELERATION: " + a.y);
        this.v.add(safeVectorMultiplyScalar(a, dt));
    }

    public applyPhysics(objects: PhysicsObject[], dt: number) {
        // before all else, check for anchor. if anchored, then NO physics may be applied to this object
        if (this.anchored) return;

        // gravity is ALWAYS on
        this.applyForce(new Force(this.mass * g, new Vector3(0, -1, 0)), dt);

        // check for collisions first
        for (const obj of objects) {
            if (obj.isBox && this.isSphere) { // prolly ground detection
                if (boxAndBallCollisionDetect(obj, this)) { // its hit the ground!
                    // just reverse y velocity and call it a day bro. "teleport" it just above the box so that it wont get clipped in

                    if (!this.radius) throw new Error("this for typescript reasons. honestly, i can probably make this better, but rn i cant be bothered to figure out a way to do so.");
                    if (this.name === "BAD BOY") console.log("UH OH");
                    this.setY(obj.y + obj.bbox.max.y + this.radius + 0.01); // give it some allowance
                    this.v.y *= -1;
                }
            }
            else if (obj.isSphere) {} // for right now just skip it i'll see if i want to do sphere on sphere collisions
        }
        
        // update position
        // this.objectMesh.position.set(this.x + this.v.x * dt, this.y + this.v.y * dt, this.z + this.v.z * dt);
        this.moveByV(dt);

        // reset total forces
        this.totalForces = [];
    }

    public setX(x: number) {
        this.objectMesh.position.x = x;
    }

    public setY(y: number) {
        this.objectMesh.position.y = y;
    }

    public setZ(z: number) {
        this.objectMesh.position.z = z;
    }

    public setPosition(pos: Vector3) {
        this.objectMesh.position.set(pos.x, pos.y, pos.z);
    }

    public moveByV(dt: number) {
        this.objectMesh.position.add(safeVectorMultiplyScalar(this.v, dt));
    }

    public get isSphere() : boolean {
        return this.objectMesh.geometry instanceof SphereGeometry;
    }

    public get isBox() : boolean {
        return this.objectMesh.geometry instanceof BoxGeometry;
    }

    public get radius() : number | undefined {
        return this.objectMesh.geometry.boundingSphere?.radius;
    }
}
