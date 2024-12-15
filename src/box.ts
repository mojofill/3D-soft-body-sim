import { Box3, BoxGeometry, Mesh, Vector3 } from "three";
import PhysicsObject from "./physicsObject";

export default class Box extends PhysicsObject {
    public bbox: Box3 = new Box3();
    
    constructor(
        public mass: number,
        public v: Vector3,
        public objectMesh: Mesh,
        public anchored: boolean
    ) {
        super(mass, v, objectMesh, anchored);
        objectMesh.geometry.computeBoundingBox();
        if (!objectMesh.geometry.boundingBox) throw new Error("bounding box not computed");
        this.bbox.copy(objectMesh.geometry.boundingBox).applyMatrix4(objectMesh.matrixWorld);
    }

    public get width() : number {
        if (!(this.objectMesh.geometry instanceof BoxGeometry)) throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.width;
    }
    
    public get height() : number {
        if (!(this.objectMesh.geometry instanceof BoxGeometry)) throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.height;
    }

    public get depth() : number {
        if (!(this.objectMesh.geometry instanceof BoxGeometry)) throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.depth;
    }
}