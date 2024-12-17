"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const physicsObject_1 = __importDefault(require("./physicsObject"));
class Box extends physicsObject_1.default {
    constructor(mass, v, objectMesh, anchored) {
        super(mass, v, objectMesh, anchored);
        this.mass = mass;
        this.v = v;
        this.objectMesh = objectMesh;
        this.anchored = anchored;
        this.bbox = new three_1.Box3();
        objectMesh.geometry.computeBoundingBox();
        if (!objectMesh.geometry.boundingBox)
            throw new Error("bounding box not computed");
        this.bbox.copy(objectMesh.geometry.boundingBox).applyMatrix4(objectMesh.matrixWorld);
    }
    get width() {
        if (!(this.objectMesh.geometry instanceof three_1.BoxGeometry))
            throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.width;
    }
    get height() {
        if (!(this.objectMesh.geometry instanceof three_1.BoxGeometry))
            throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.height;
    }
    get depth() {
        if (!(this.objectMesh.geometry instanceof three_1.BoxGeometry))
            throw new Error("not a box mate");
        return this.objectMesh.geometry.parameters.depth;
    }
}
exports.default = Box;
