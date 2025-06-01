import { Game } from "./Game/Game";
import { bootstrap } from "./Utils/bootstrap";
import { Physics } from "./Utils/Physics";


(async ()=>{
    const p = await Physics.init()
    bootstrap(p,()=>{
        new Game()
    });

})()


// import * as THREE from 'three';
// import RAPIER from '@dimforge/rapier3d';
// import GUI from 'lil-gui';

// let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
// let controller: RAPIER.KinematicCharacterController;
// let rigidBody: RAPIER.RigidBody;
// let collider: RAPIER.Collider;
// let world: RAPIER.World;

// const input = {
//     forward: false,
//     backward: false,
//     left: false,
//     right: false,
//     jump: false,
// };

// const params = {
//     speed: 5,
//     jumpVelocity: 0.4,
//     grounded: false,
// };

// let verticalVelocity = 0;
// let isJumping = false;
// let maxJumpHeight = 0;
// let deltaTime = 1 / 60;

// const clock = new THREE.Clock();

// async function init() {
//     const RAPIER = (await import('@dimforge/rapier3d')).default;
//     world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

//     controller = world.createCharacterController(0.001);
//     controller.setCharacterMass(30);
//     controller.enableAutostep(0.07, 0.03, true);
//     controller.enableSnapToGround(0.07);
//     controller.setApplyImpulsesToDynamicBodies(true);

//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
//     camera.position.set(0, 5, 10);

//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(renderer.domElement);

//     // Ground
//     const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
//     const groundCollider = RAPIER.ColliderDesc.cuboid(10, 0.5, 10);
//     world.createCollider(groundCollider, groundBody);
//     const groundMesh = new THREE.Mesh(
//         new THREE.BoxGeometry(20, 1, 20),
//         new THREE.MeshStandardMaterial({ color: 0x777777 })
//     );
//     groundMesh.position.y = -0.5;
//     scene.add(groundMesh);

//     // Player
//     const rbDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 5, 0);
//     rigidBody = world.createRigidBody(rbDesc);
//     const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5).setTranslation( 0, 1, 0 );
//     collider = world.createCollider(colliderDesc, rigidBody);

//     const playerMesh = new THREE.Mesh(
//         new THREE.CapsuleGeometry(0.5, 1),
//         new THREE.MeshStandardMaterial({ color: 0xff4444 })
//     );
//     scene.add(playerMesh);

//     const light = new THREE.DirectionalLight(0xffffff, 1);
//     light.position.set(10, 10, 10);
//     scene.add(light, new THREE.AmbientLight(0x404040));

//     // GUI
//     const gui = new GUI();
//     gui.add(params, 'speed', 0.01, 20).name('Speed');
//     gui.add(params, 'jumpVelocity', 0.1, 2).name('Jump Velocity');
//     gui.add(params, 'grounded').listen();

//     // Input
//     window.addEventListener('keydown', (e) => {
//         if (e.code === 'KeyW') input.forward = true;
//         if (e.code === 'KeyS') input.backward = true;
//         if (e.code === 'KeyA') input.left = true;
//         if (e.code === 'KeyD') input.right = true;
//         if (e.code === 'Space') input.jump = true;
//     });
//     window.addEventListener('keyup', (e) => {
//         if (e.code === 'KeyW') input.forward = false;
//         if (e.code === 'KeyS') input.backward = false;
//         if (e.code === 'KeyA') input.left = false;
//         if (e.code === 'KeyD') input.right = false;
//         if (e.code === 'Space') input.jump = false;
//     });

//     animate(playerMesh);
// }

// function animate(playerMesh: THREE.Mesh) {
//     requestAnimationFrame(() => animate(playerMesh));

//     deltaTime = clock.getDelta();
//     world.timestep = deltaTime;

//     let move = new THREE.Vector3();
//     if (input.forward) move.z -= 1;
//     if (input.backward) move.z += 1;
//     if (input.left) move.x -= 1;
//     if (input.right) move.x += 1;

//     move.normalize().multiplyScalar(params.speed);

//     const grounded = controller.computedGrounded();
//     params.grounded = grounded;

//     if (grounded) {
//         if (isJumping) {
//             maxJumpHeight -= params.jumpVelocity;
//             verticalVelocity = params.jumpVelocity;
//             if (maxJumpHeight < 1) {
//                 isJumping = false;
//             }
//         } else {
//             verticalVelocity = 0;
//         }
//     } else {
//         if (isJumping) {
//             maxJumpHeight -= params.jumpVelocity;
//             if (maxJumpHeight < 1) {
//                 isJumping = false;
//                 verticalVelocity = -0.5;
//             }
//         } else {
//             verticalVelocity -= 9.81 * deltaTime;
//         }
//     }

//     if (input.jump && grounded) {
//         isJumping = true;
//         maxJumpHeight = 10;
//         verticalVelocity = params.jumpVelocity;
//     }

//     move.y = verticalVelocity;

//     controller.computeColliderMovement(collider, move);
//     const corrected = controller.computedMovement();
//     const current = rigidBody.translation();
//     const nextPos = {
//         x: current.x + corrected.x,
//         y: current.y + corrected.y,
//         z: current.z + corrected.z,
//     };
//     rigidBody.setNextKinematicTranslation(nextPos);

//     playerMesh.position.lerp(new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z), 0.3);
//     camera.position.lerp(playerMesh.position.clone().add(new THREE.Vector3(0, 5, 10)), 0.1);
//     camera.lookAt(playerMesh.position);

//     world.step();
//     renderer.render(scene, camera);
// }

// init();
