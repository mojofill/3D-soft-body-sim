"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const PointerLockControls_js_1 = require("three/examples/jsm/controls/PointerLockControls.js");
const ball_1 = __importDefault(require("./ball"));
const box_1 = __importDefault(require("./box"));
const utils_1 = require("./utils");
const spring_1 = require("./spring");
// three stuff
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// add controls
const controls = new PointerLockControls_js_1.PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);
// list of objects
let objects = []; // ONLY REASON WHY THIS IS NOT A CONST IS BECAUSE OF A RETARDED BUG
const springs = [];
// CONSTANTS -- might move this to utils
const time = {
    past: new Date().getTime() / 1000,
    now: new Date().getTime() / 1000,
    get dt() {
        return this.now - this.past > 0.05 ? 0 : utils_1.dt;
    },
    update() {
        this.past = this.now;
        this.now = new Date().getTime() / 1000;
    }
};
let pause = false;
const ground_width = 5;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
    r: false
};
function init() {
    // resize canvas to full screen
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.margin = '0px';
    canvas.style.top = canvas.style.left = '0px';
    // three needs this in order to use the renderer
    document.body.appendChild(renderer.domElement);
    // set background color
    scene.background = new THREE.Color().setRGB(0.5, 0.5, 0.5);
    // set initial camera position
    camera.position.z = 50;
    camera.position.y = 10;
    addLighting(); // adds directional and ambient lighting
    addGround();
    addAllInitialObjects(); // initializes all the starting objects
    addEventListeners(); // listens to key inputs
}
function addLighting() {
    // enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default PCFShadowMap
    // add direction lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 30, 1); // default light shining from the top
    light.castShadow = true; // default false
    scene.add(light);
    // add ambient lighting (makes lighting less harsh on the eyes)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
}
function addAllInitialObjects() {
    const ball_radius = 0.5;
    const width = 10;
    const height = 1;
    const depth = 10;
    const mass = 1;
    const start_v = new THREE.Vector3();
    const dist = 2;
    const start_x = -width / 2 * dist - ball_radius;
    const start_y = 20;
    const start_z = -depth / 2 * dist - ball_radius;
    const ball_arr = [];
    let i = 0;
    for (let z = 0; z < depth; z++) {
        ball_arr.push([]);
        for (let y = 0; y < height; y++) {
            ball_arr[z].push([]);
            for (let x = 0; x < width; x++) {
                const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
                const ball = new ball_1.default(mass, start_v, ballMesh, false);
                ball.setPosition(new THREE.Vector3(start_x + dist * x, start_y + dist * y, start_z + dist * z));
                // add ball to objects
                ball_arr[z][y].push(ball);
                // add ball to scene
                // scene.add(ballMesh); // TAKE THIS OUT CUZ OF THIS STUPID ASS BUG
                objects.push(ball); // adds it to list of physical objects in the scene
                i++;
                ball.name = "FUCK " + x + ' ' + y + ' ' + z;
            }
        }
    }
    // fine. if thats how this STUPID IDIOT BULLSHIT CODE wants to do it i dont give a fuck anymore
    objects = objects.map((obj) => {
        if (obj.name.substring(0, 4) === 'FUCK') {
            const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(ball_radius), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
            const new_ball = new ball_1.default(1, new THREE.Vector3(), ballMesh, false);
            new_ball.setPosition(new THREE.Vector3(obj.x, obj.y, obj.z));
            scene.add(ballMesh);
            // update it in ball_arr
            const arr = obj.name.split(' ');
            const x = parseInt(arr[1]);
            const y = parseInt(arr[2]);
            const z = parseInt(arr[3]);
            ball_arr[z][y][x] = new_ball;
            return new_ball;
        }
        else
            return obj;
    });
    for (let z = 0; z < ball_arr.length; z++) {
        for (let y = 0; y < ball_arr[z].length; y++) {
            for (let x = 0; x < ball_arr[z][y].length; x++) {
                // consider one after each axis
                // 0th in x axis:
                // connect to ball up, right, up_right, down_right, in, in_right, in_up, in_up_right, in_down, in_down_right, out_up_right, out_up_left
                // honestly bro just debug this. figure out what u gotta add and then write it down
                const curr_ball = ball_arr[z][y][x];
                const ball_up = y === ball_arr[z].length - 1 ? null : ball_arr[z][y + 1][x];
                const ball_right = x === ball_arr[z][y].length - 1 ? null : ball_arr[z][y][x + 1];
                const ball_in = z === ball_arr.length - 1 ? null : ball_arr[z + 1][y][x];
                const ball_up_right = (ball_up && ball_right) ? ball_arr[z][y + 1][x + 1] : null;
                const ball_down_right = (y > 0 && ball_right) ? ball_arr[z][y - 1][x + 1] : null;
                const ball_in_up = (ball_in && ball_up) ? ball_arr[z + 1][y + 1][x] : null;
                const ball_in_down = (ball_in && y > 0) ? ball_arr[z + 1][y - 1][x] : null;
                const ball_in_right = (ball_in && ball_right) ? ball_arr[z + 1][y][x + 1] : null;
                const ball_in_left = (ball_in && x > 0) ? ball_arr[z + 1][y][x - 1] : null;
                const ball_in_up_right = (ball_in && ball_up && ball_right) ? ball_arr[z + 1][y + 1][x + 1] : null;
                const ball_in_up_left = (ball_in && ball_up && x > 0) ? ball_arr[z + 1][y + 1][x - 1] : null;
                const ball_out_up_right = (z > 0 && ball_up && ball_right) ? ball_arr[z - 1][y + 1][x + 1] : null;
                const ball_out_up_left = (z > 0 && ball_up && x > 0) ? ball_arr[z - 1][y + 1][x - 1] : null;
                // just have these first
                // fuck it. right now, just these and lets see how this goes
                let spring1 = null; // this and up
                let spring2 = null; // this and right
                let spring3 = null; // this and in
                let spring4 = null; // this and up_right
                let spring5 = null; // this and down_right
                let spring6 = null; // this and in_up
                let spring7 = null; // this and in_down
                let spring8 = null; // this and in_right
                let spring9 = null; // this and in_left
                let spring10 = null; // this and in_up_right
                let spring11 = null; // this and in_up_left
                let spring12 = null; // this and out_up_right
                let spring13 = null; // this and out_up_left
                if (ball_up)
                    spring1 = new spring_1.Spring(curr_ball, ball_up, utils_1.k, utils_1.c, scene);
                if (ball_right)
                    spring2 = new spring_1.Spring(curr_ball, ball_right, utils_1.k, utils_1.c, scene);
                if (ball_in)
                    spring3 = new spring_1.Spring(curr_ball, ball_in, utils_1.k, utils_1.c, scene);
                if (ball_up_right)
                    spring4 = new spring_1.Spring(curr_ball, ball_up_right, utils_1.k, utils_1.c, scene);
                if (ball_down_right)
                    spring5 = new spring_1.Spring(curr_ball, ball_down_right, utils_1.k, utils_1.c, scene);
                if (ball_in_up)
                    spring6 = new spring_1.Spring(curr_ball, ball_in_up, utils_1.k, utils_1.c, scene);
                if (ball_in_down)
                    spring7 = new spring_1.Spring(curr_ball, ball_in_down, utils_1.k, utils_1.c, scene);
                if (ball_in_right)
                    spring8 = new spring_1.Spring(curr_ball, ball_in_right, utils_1.k, utils_1.c, scene);
                if (ball_in_left)
                    spring9 = new spring_1.Spring(curr_ball, ball_in_left, utils_1.k, utils_1.c, scene);
                if (ball_in_up_right)
                    spring10 = new spring_1.Spring(curr_ball, ball_in_up_right, utils_1.k, utils_1.c, scene);
                if (ball_in_up_left)
                    spring11 = new spring_1.Spring(curr_ball, ball_in_up_left, utils_1.k, utils_1.c, scene);
                if (ball_out_up_right)
                    spring12 = new spring_1.Spring(curr_ball, ball_out_up_right, utils_1.k, utils_1.c, scene);
                if (ball_out_up_left)
                    spring13 = new spring_1.Spring(curr_ball, ball_out_up_left, utils_1.k, utils_1.c, scene);
                if (spring1)
                    springs.push(spring1);
                if (spring2)
                    springs.push(spring2);
                if (spring3)
                    springs.push(spring3);
                if (spring4)
                    springs.push(spring4);
                if (spring5)
                    springs.push(spring5);
                if (spring6)
                    springs.push(spring6);
                if (spring7)
                    springs.push(spring7);
                if (spring8)
                    springs.push(spring8);
                if (spring9)
                    springs.push(spring9);
                if (spring10)
                    springs.push(spring10);
                if (spring11)
                    springs.push(spring11);
                if (spring12)
                    springs.push(spring12);
                if (spring13)
                    springs.push(spring13);
            }
        }
    }
}
function addGround() {
    // add ground to scene
    const groundGeometry = new THREE.BoxGeometry(ground_width, 1, ground_width);
    const groundMesh = new THREE.Mesh(groundGeometry, new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(1, 1, 1) }) // TRY MESH TOON MATERIAL LOL
    );
    groundMesh.position.set(0, -1, 0);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    const ground = new box_1.default(1, new THREE.Vector3(), groundMesh, true);
    ground.name = "GROUND";
    objects.push(ground);
}
// add event listeners
function addEventListeners() {
    document.addEventListener('click', () => controls.lock());
    document.addEventListener('keydown', e => {
        switch (e.key.toLowerCase()) {
            case "w":
                keys.w = true;
                break;
            case "a":
                keys.a = true;
                break;
            case "s":
                keys.s = true;
                break;
            case "d":
                keys.d = true;
                break;
            case "shift":
                keys.shift = true;
                break;
            case " ":
                keys.space = true;
                break;
        }
    });
    document.addEventListener('keyup', e => {
        switch (e.key.toLowerCase()) {
            case "w":
                keys.w = false;
                break;
            case "a":
                keys.a = false;
                break;
            case "s":
                keys.s = false;
                break;
            case "d":
                keys.d = false;
                break;
            case "shift":
                keys.shift = false;
                break;
            case " ":
                keys.space = false;
                break;
            case "r":
                keys.r = true;
                break;
            case "p":
                pause = !pause;
                break;
        }
    });
}
// listens to key inputs
function keyFunctions() {
    // direction, (+/-)
    const z = Number(keys.w) - Number(keys.s);
    const x = Number(keys.d) - Number(keys.a);
    const y = Number(keys.space) - Number(keys.shift);
    controls.moveForward(z * utils_1.camera_speed * time.dt);
    controls.moveRight(x * utils_1.camera_speed * time.dt);
    camera.position.y += y * utils_1.camera_speed * time.dt;
    if (keys.r)
        window.location.reload();
}
init();
// start animation loop
renderer.setAnimationLoop(() => {
    time.update();
    keyFunctions();
    controls.update(time.dt);
    for (const spring of springs) {
        spring.applySpringPhysics(time.dt);
    }
    if (!pause) {
        for (const obj of objects) {
            obj.applyPhysics(objects, time.dt);
        }
    }
    renderer.render(scene, camera);
});