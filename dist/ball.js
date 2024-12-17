"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const physicsObject_1 = __importDefault(require("./physicsObject"));
class Ball extends physicsObject_1.default {
    constructor(mass, v, objectMesh, anchored) {
        super(mass, v, objectMesh, anchored);
        this.mass = mass;
        this.v = v;
        this.objectMesh = objectMesh;
        this.anchored = anchored;
    }
}
exports.default = Ball;
