import { Box3, Sphere, Vector3 } from "three";
import Ball from "./ball";
import PhysicsObject from "./physicsObject";

export const g = 10;
export const camera_speed = 30;
export const dt = 0.01;
export const k = 500;
export const c = 10;

export function boxAndBallCollisionDetect(box: PhysicsObject, ball: Ball) : boolean {
    // TODO -- it should be similar to the 2d rect and circle collision detect
    // basically, check extend the box in all three axis by r. 

    // for right now man, all boxs are going to be flat. i cant be bothered to make it angled

    // ohhh shit three does it for me lets fricking go

    // might just have to do a little workaround man

    const bbox = new Box3();
    if (!box.objectMesh.geometry.boundingBox) box.objectMesh.geometry.computeBoundingBox();
    if (!box.objectMesh.geometry.boundingBox) throw new Error('fucking typescript bro');
    bbox.copy(box.objectMesh.geometry.boundingBox).applyMatrix4(box.objectMesh.matrixWorld);

    return bbox.intersectsSphere(new Sphere(new Vector3(ball.x, ball.y, ball.z), ball.radius));
}

export function ballAndBallCollisionDetect(ball1: Ball, ball2: Ball) : boolean {
    if (!ball1.objectMesh.geometry.boundingSphere) throw new Error("yeah there aint a bounding sphere mate");

    return ball1.objectMesh.geometry.boundingSphere.intersectsSphere(new Sphere(new Vector3(ball2.x, ball2.y, ball2.z), ball2.radius));
}

// ONLY reason these exist is because stupid fucking threejs does it so that when you multiply a vector, the vector itself gets changed, which is BULLSHIT btw - why cant they provide a function man whatever bro stupid idiots
export function safeVectorMultiplyScalar(v: Vector3, s: number) {
    const _v = new Vector3().copy(v);
    return _v.multiplyScalar(s);
}

export function safeVectorDotProduct(v1: Vector3, v2: Vector3) {
    const _v1 = new Vector3().copy(v1);
    return _v1.dot(v2);
}

export function safeVectorDivideScalar(v: Vector3, s: number) {
    const _v = new Vector3().copy(v);
    return _v.divideScalar(s);
}
