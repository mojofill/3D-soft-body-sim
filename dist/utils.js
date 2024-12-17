"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.c = exports.k = exports.dt = exports.camera_speed = exports.g = void 0;
exports.boxAndBallCollisionDetect = boxAndBallCollisionDetect;
exports.ballAndBallCollisionDetect = ballAndBallCollisionDetect;
exports.safeVectorMultiplyScalar = safeVectorMultiplyScalar;
exports.safeVectorDotProduct = safeVectorDotProduct;
exports.safeVectorDivideScalar = safeVectorDivideScalar;
const three_1 = require("three");
exports.g = 5;
exports.camera_speed = 30;
exports.dt = 0.01;
exports.k = 500;
exports.c = 5;
function boxAndBallCollisionDetect(box, ball) {
    // TODO -- it should be similar to the 2d rect and circle collision detect
    // basically, check extend the box in all three axis by r. 
    // for right now man, all boxs are going to be flat. i cant be bothered to make it angled
    // ohhh shit three does it for me lets fricking go
    // might just have to do a little workaround man
    const bbox = new three_1.Box3();
    if (!box.objectMesh.geometry.boundingBox)
        box.objectMesh.geometry.computeBoundingBox();
    if (!box.objectMesh.geometry.boundingBox)
        throw new Error('fucking typescript bro');
    bbox.copy(box.objectMesh.geometry.boundingBox).applyMatrix4(box.objectMesh.matrixWorld);
    return bbox.intersectsSphere(new three_1.Sphere(new three_1.Vector3(ball.x, ball.y, ball.z), ball.radius));
}
function ballAndBallCollisionDetect(ball1, ball2) {
    if (!ball1.objectMesh.geometry.boundingSphere)
        throw new Error("yeah there aint a bounding sphere mate");
    return ball1.objectMesh.geometry.boundingSphere.intersectsSphere(new three_1.Sphere(new three_1.Vector3(ball2.x, ball2.y, ball2.z), ball2.radius));
}
// ONLY reason these exist is because stupid fucking threejs does it so that when you multiply a vector, the vector itself gets changed, which is BULLSHIT btw - why cant they provide a function man whatever bro stupid idiots
function safeVectorMultiplyScalar(v, s) {
    const _v = new three_1.Vector3().copy(v);
    return _v.multiplyScalar(s);
}
function safeVectorDotProduct(v1, v2) {
    const _v1 = new three_1.Vector3().copy(v1);
    return _v1.dot(v2);
}
function safeVectorDivideScalar(v, s) {
    const _v = new three_1.Vector3().copy(v);
    return _v.divideScalar(s);
}
