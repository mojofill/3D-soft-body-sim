import { Mesh, Vector3 } from "three";
import PhysicsObject from "./physicsObject";

export default class Ball extends PhysicsObject {
    constructor(
        public mass: number,
        public v: Vector3,
        public objectMesh: Mesh,
        public anchored: boolean
    ) {
        super(mass, v, objectMesh, anchored);
    }
}