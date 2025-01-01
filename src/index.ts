import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import Ball from './ball';
import PhysicsObject from './physicsObject';
import Force from './force';
import Box from './box';
import { g, camera_speed, dt, k, c } from './utils';
import { Spring } from './spring';

// three stuff
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// add controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// list of objects
let objects: PhysicsObject[] = []; // ONLY REASON WHY THIS IS NOT A CONST IS BECAUSE OF A RETARDED BUG
let springs: Spring[] = [];

// CONSTANTS -- might move this to utils

const time = {
    past: new Date().getTime() / 1000,
    now: new Date().getTime() / 1000,
    get dt() { 
        return this.now - this.past > 0.05 ? 0 : dt;
    },
    update() {
        this.past = this.now;
        this.now = new Date().getTime() / 1000;
    }
};

let pause = false;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    r: false,
    shift: false,
    space: false,
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

const ground_width = 30;
const renderSpring = true;

function addAllInitialObjects() {
    const ball_radius = 0.3;
    const width = 20;
    const height = 2;
    const depth = 10;
    const mass = 1;
    const start_v = new THREE.Vector3();
    const dist = 3;
    const start_x = -width/2 * dist - ball_radius;
    const start_y = 20;
    const start_z = -depth/2 * dist - ball_radius;

    const ball_arr: Ball[][][] = [];

    let i = 0;

    for (let z = 0; z < depth; z++) {
        ball_arr.push([]);
        for (let y = 0; y < height; y++) {
            ball_arr[z].push([]);
            for (let x = 0; x < width; x++) {
                const ballMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2),
                    new THREE.MeshStandardMaterial({color: 0xff0000})
                );
                const ball = new Ball(mass, start_v, ballMesh, false);
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
            const ballMesh = new THREE.Mesh(
                new THREE.SphereGeometry(ball_radius),
                new THREE.MeshStandardMaterial({color: 0xff0000})
            );
            // const new_ball = new Ball(1, new THREE.Vector3(), ballMesh, false);
            const new_ball = new Ball(mass, new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5), ballMesh, false);
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
        else return obj;
    });

    for (let z = 0; z < ball_arr.length; z++) {
        for (let y = 0; y < ball_arr[z].length; y++) {
            for (let x = 0; x < ball_arr[z][y].length; x++) {
                // consider one after each axis

                // 0th in x axis:
                // connect to ball up, right, up_right, down_right, in, in_right, in_up, in_up_right, in_down, in_down_right, out_up_right, out_up_left

                // honestly bro just debug this. figure out what u gotta add and then write it down

                const curr_ball = ball_arr[z][y][x];

                const ball_up = y === ball_arr[z].length - 1 ? null : ball_arr[z][y+1][x];
                const ball_right = x === ball_arr[z][y].length - 1 ? null : ball_arr[z][y][x+1];
                const ball_in = z === ball_arr.length - 1 ? null : ball_arr[z+1][y][x];
                const ball_up_right = (ball_up && ball_right) ? ball_arr[z][y+1][x+1] : null;
                const ball_down_right = (y > 0 && ball_right) ? ball_arr[z][y-1][x+1] : null;
                const ball_in_up = (ball_in && ball_up) ? ball_arr[z+1][y+1][x] : null;
                const ball_in_down = (ball_in && y > 0) ? ball_arr[z+1][y-1][x] : null;
                const ball_in_right = (ball_in && ball_right) ? ball_arr[z+1][y][x+1] : null;
                const ball_in_left = (ball_in && x > 0) ? ball_arr[z+1][y][x-1] : null;
                const ball_in_up_right = (ball_in && ball_up && ball_right) ? ball_arr[z+1][y+1][x+1] : null;
                const ball_in_up_left = (ball_in && ball_up && x > 0) ? ball_arr[z+1][y+1][x-1] : null;
                const ball_out_up_right = (z > 0 && ball_up && ball_right) ? ball_arr[z-1][y+1][x+1] : null;
                const ball_out_up_left = (z > 0 && ball_up && x > 0) ? ball_arr[z-1][y+1][x-1] : null;

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
                    
                if (ball_up) spring1 = new Spring(curr_ball, ball_up, k , c, scene, renderSpring);
                if (ball_right) spring2 = new Spring(curr_ball, ball_right, k, c, scene, renderSpring);
                if (ball_in) spring3 = new Spring(curr_ball, ball_in, k, c, scene, renderSpring);
                if (ball_up_right) spring4 = new Spring(curr_ball, ball_up_right, k, c, scene, renderSpring);
                if (ball_down_right) spring5 = new Spring(curr_ball, ball_down_right, k, c, scene, renderSpring);
                if (ball_in_up) spring6 = new Spring(curr_ball, ball_in_up, k, c, scene, renderSpring);
                if (ball_in_down) spring7 = new Spring(curr_ball, ball_in_down, k, c, scene, renderSpring);
                if (ball_in_right) spring8 = new Spring(curr_ball, ball_in_right, k, c, scene, renderSpring);
                if (ball_in_left) spring9 = new Spring(curr_ball, ball_in_left, k, c, scene, renderSpring);
                if (ball_in_up_right) spring10 = new Spring(curr_ball, ball_in_up_right, k, c, scene, renderSpring);
                if (ball_in_up_left) spring11 = new Spring(curr_ball, ball_in_up_left, k, c, scene, renderSpring);
                if (ball_out_up_right) spring12 = new Spring(curr_ball, ball_out_up_right, k, c, scene, renderSpring);
                if (ball_out_up_left) spring13 = new Spring(curr_ball, ball_out_up_left, k, c, scene, renderSpring);

                if (spring1) springs.push(spring1);
                if (spring2) springs.push(spring2);
                if (spring3) springs.push(spring3);
                if (spring4) springs.push(spring4);
                if (spring5) springs.push(spring5);
                if (spring6) springs.push(spring6);
                if (spring7) springs.push(spring7);
                if (spring8) springs.push(spring8);
                if (spring9) springs.push(spring9);
                if (spring10) springs.push(spring10);
                if (spring11) springs.push(spring11);
                if (spring12) springs.push(spring12);
                if (spring13) springs.push(spring13);
            }
        }
    }
}

function addGround() {
    // add ground to scene
    const groundGeometry = new THREE.BoxGeometry(ground_width, 1, ground_width);
    const groundMesh = new THREE.Mesh(
        groundGeometry,
        new THREE.MeshStandardMaterial({color: new THREE.Color().setRGB(1, 1, 1)}) // TRY MESH TOON MATERIAL LOL
    )
    groundMesh.position.set(0, -1, 0);
    groundMesh.receiveShadow = true;
    groundMesh.name = "GROUND";
    scene.add(groundMesh);

    const ground = new Box(1, new THREE.Vector3(), groundMesh, true);
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
            case "r":
                keys.r = true;
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
            case "r":
                keys.r = false;
                break;
            case "shift":
                keys.shift = false;
                break;
            case " ":
                keys.space = false;
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

    controls.moveForward(z * camera_speed * time.dt);
    controls.moveRight(x * camera_speed * time.dt);
    camera.position.y += y * camera_speed * time.dt;

    if (keys.r) {
        for(let i = scene.children.length - 1; i >= 0; i--) { 
            const obj = scene.children[i];
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                obj.material.dispose();
            }
            scene.remove(obj);
        }
        
        objects = [];
        springs = [];
        addAllInitialObjects();
        addGround();
    }
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
