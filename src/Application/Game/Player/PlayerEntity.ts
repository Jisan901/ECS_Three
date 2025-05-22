import * as EntityUtils from '../Utils/EntityUtils';
import * as STATES from "../Utils/CommonStates";
import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils.js';


export class PlayerEntity extends EntityUtils.Entity {
    mesh: THREE.Object3D;
    pickHelper: any;
    mixer: THREE.AnimationMixer;
    animations: { [key: string]: THREE.AnimationAction } = {};

    constructor(props: any, mesh: THREE.Object3D){
        super(props)
        this.mesh = mesh;
        this.pickHelper;
        this.loadManual();
    }

    loadManual(): void {
        this.mixer = new THREE.AnimationMixer(this.mesh);
        
        const anim: any = this.mesh;
        this.animations['idle'] = this.mixer.clipAction(anim.userData.animations['idle'].animations[0]);
        this.animations['walk'] = this.mixer.clipAction(anim.userData.animations['walk'].animations[0]);
        this.animations['run'] = this.mixer.clipAction(anim.userData.animations['run'].animations[0]);
        this.animations['falling'] = this.mixer.clipAction(anim.userData.animations['falling'].animations[0]);

        this.stateMachine.addState(new STATES.Walk(this) as STATES.State)
        this.stateMachine.addState(new STATES.Run(this))
        this.stateMachine.addState(new STATES.Idle(this))
        this.stateMachine.addState(new STATES.Fall(this))

        this.onLoadEnd()
        this.stateMachine.dispatch('idle')
    }
}

export class PlayerInputSystem extends EntityUtils.InputSystem {
    padState: any;

    constructor(controller: any, padState: any){
        super(controller);
        this.padState = padState;
        for (let key in this.padState.buttons) {
            this.keys[key] = this.padState.buttons[key];
        }
    }

    update(time: number): void {
        this.keys = { ...this.keys, ...this.padState };
        for (let key in this.padState.buttons) {
            this.keys[key] = this.padState.buttons[key];
        }
    }
}


export class PlayerController extends EntityUtils.BasicController {
    raycaster: THREE.Raycaster;
    component: any;
    camera: THREE.Camera;
    target: THREE.Object3D;
    timeElapsed: number;
    lookAt: THREE.Vector3;
    camera_holder: THREE.Object3D;
    camera_holder_pawn: THREE.Object3D;
    previousArmLen: number;

    constructor(entity: any, camera: THREE.Camera, target: THREE.Object3D, component: any) {
        super(entity);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(3);
        this.component = component;
        this.camera = camera;
        this.target = target;
        this.timeElapsed = 0;
        this.lookAt = new THREE.Vector3(0);

        this.camera_holder = new THREE.Object3D();
        this.camera_holder_pawn = new THREE.Object3D();

        function resetTransform(obj: THREE.Object3D) {
            obj.position.set(0, 0, 0);
            obj.quaternion.identity();
            obj.scale.set(1, 1, 1);
            obj.updateMatrixWorld(true);
        }

        resetTransform(this.camera);
        this.camera.rotation.y = -Math.PI;
        this.camera_holder.add(this.camera);
        this.camera_holder_pawn.add(this.camera_holder);
        this.previousArmLen = 6;
    }

    updatePositionRotation(delta: number): void {
        this.timeElapsed += delta;
        let useSpringRotation = true;
        const padState = this.inputSystem.keys;
        let hudData = padState.hudData;
        let padData = padState;

        let speedFactor = this.inputSystem.keys.autoSwitch.switch ? 6 : 0;
        const smoothFactor = 1.0 - Math.pow(0.001, delta);

        const speed = this.component.physics.isGrounded ? 6 : 12;
        const moveX = hudData.deltaX * delta * speed;
        const moveZ = (-hudData.deltaY * delta * speed) + (speedFactor * delta * -5.0);
        let needTolerp = Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001;

        if (this.inputSystem.keys.left || this.inputSystem.keys.right) {
            padData.rotationPad.setPhiTheta(-delta * hudData.deltaX, 0);
            useSpringRotation = true;
        }

        const forward = this.target.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
        const left = new THREE.Vector3().crossVectors(forward, this.target.up).normalize();

        const moveVector = new THREE.Vector3()
            .addScaledVector(left, moveX)
            .addScaledVector(forward, moveZ);

        const mapped = this.component.updatePosition(moveVector);
        this.target.position.lerp(mapped, smoothFactor);

        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), padData.phi);
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), padData.theta);
        const targetQuat = qx.clone().multiply(qy);

        if ((needTolerp && useSpringRotation) || speedFactor) {
            this.target.quaternion.slerp(qx, smoothFactor);
        }

        const armLength = lerp(this.previousArmLen, 6 + speedFactor, smoothFactor);
        this.previousArmLen = armLength;
        const cameraTarget = this.target.position.clone().add(new THREE.Vector3(0, 3, 0));
        const armVector = new THREE.Vector3(0, 0, armLength).applyQuaternion(targetQuat);

        this.camera_holder_pawn.position.lerp(cameraTarget.clone().add(armVector), smoothFactor);
        this.camera_holder.position.copy(new THREE.Vector3(-1, 0, 0));
        this.camera_holder_pawn.lookAt(cameraTarget);
        this.camera_holder_pawn.updateMatrixWorld(true);
    }

    beforeUpdate(vec: THREE.Vector3): THREE.Vector3 {
        return vec;
    }
}
// export class PlayerController extends EntityUtils.BasicController{
//     constructor(entity, camera, target, component){
//         super(entity)
//         this.raycaster = new THREE.Raycaster();
//         this.raycaster.layers.set( 3 );
//         this.component = component;
//         this.camera = camera;
//         this.target = target;
//         this.timeElapsed = 0;
//         this.lookAt = new THREE.Vector3(0)

//         this.camera_holder = new THREE.Object3D()
//         this.camera_holder_pawn = new THREE.Object3D()
//         function resetTransform(obj) {
//             obj.position.set(0, 0, 0);
//             obj.quaternion.identity(); // better than obj.rotation.set
//             obj.scale.set(1, 1, 1);
//             obj.updateMatrixWorld(true);
//           }
//         resetTransform(this.camera)
//         this.camera.rotation.y = -Math.PI
//         this.camera_holder.add(this.camera)
//         this.camera_holder_pawn.add(this.camera_holder)
//         this.previousArmLen = 6

//     }

//     updatePositionRotation(delta){
    
//         this.timeElapsed += delta;
//         let useSpringRotation = true
//         const padState = this.inputSystem.keys;
//         let hudData = padState.hudData; //{deltaX,deltaY}
//         let padData = padState; // {phi, theta}
        
//         let speedFactor = this.inputSystem.keys.autoSwitch.switch?6 :0;
//         const smoothFactor = 1.0 - Math.pow(0.001, delta);
//         // +1 to -1 for both
//         // Movement input
//         const speed = this.component.physics.isGrounded?6:12;
//         const moveX = hudData.deltaX * delta * speed ; // 5 is speed
//         const moveZ = (-(hudData.deltaY) * delta * speed) + (speedFactor * delta * -5.0) ;
//         let needTolerp = Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001;

//         // const _Q = new THREE.Quaternion();
//         // const _A = new THREE.Vector3();
//         // const _R = this.target.quaternion.clone();

//         if (this.inputSystem.keys.left || this.inputSystem.keys.right) {
//             // _A.set(0, 1, 0);
//             // _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * hudData.deltaX);
//             // _R.multiply(_Q);
//             padData.rotationPad.setPhiTheta( -delta * hudData.deltaX , 0)
//             //this.target.quaternion.slerp(_R,smoothFactor)
//             useSpringRotation = true
//             //needTolerp = true
//         }
//         // Smooth factor

//         // Directions
//         const forward = this.target.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
//         const left = new THREE.Vector3().crossVectors(forward, this.target.up).normalize();

//         // Movement
//         const moveVector = new THREE.Vector3()
//             .addScaledVector(left, moveX)
//             .addScaledVector(forward, moveZ);

        
        
//         // apply physics
//         let mapped = this.component.updatePosition(moveVector)
//         this.target.position.lerp(mapped,smoothFactor)
        
            
        
        
        
//         // Rotation
//         const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), padData.phi);
//         const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), padData.theta);
//         const targetQuat = qx.clone().multiply(qy);

//         if ((needTolerp&&useSpringRotation)||speedFactor) {
//             this.target.quaternion.slerp(qx, smoothFactor);
//         }

//         // if (!useSpringRotation||speedFactor===0) {
//         //     targetQuat.copy(this.target.quaternion)
//         // }

//         // Camera system
//         const armLength = lerp(this.previousArmLen,6 + (speedFactor), smoothFactor)
//         this.previousArmLen = armLength
//         const cameraTarget = this.target.position.clone().add(new THREE.Vector3(0, 3, 0));
//         const armVector = new THREE.Vector3(0, 0, armLength).applyQuaternion(targetQuat); // spring arm
//         this.camera_holder_pawn.position.lerp(cameraTarget.clone().add(armVector), smoothFactor);
//         this.camera_holder.position.copy(new THREE.Vector3(-1, 0, 0));
//         this.camera_holder_pawn.lookAt(cameraTarget);
//         this.camera_holder_pawn.updateMatrixWorld(true)
//         // this.target.lookAt(this.lookAt)

//         // const camwp = new THREE.Vector3()
//         // this.camera_holder_pawn.getWorldPosition(camwp)
//         //this.camera.position.lerp(camwp,lerpFactor);
        

//         // const cap = targetPosition
//         // this.debugBox.position.copy(this.camera_holder_pawn.position)
//         // this.debugBox.rotation.copy(this.camera_holder_pawn.rotation)

//         // const positions = this.debugLine.geometry.attributes.position.array;
//         // positions[0] = camwp.x;
//         // positions[1] = camwp.y;
//         // positions[2] = camwp.z;

//         // positions[3] = cap.x;
//         // positions[4] = cap.y;
//         // positions[5] = cap.z;



//         // this.debugLine.geometry.attributes.position.needsUpdate = true;

//         // //forward.setLength(-8)
//         // let left2 = new THREE.Vector3().crossVectors(forward2, this.target.up).normalize().setLength(0);
//         // // targetPosition.add(new THREE.Vector3(0,5,10));
//         // targetPosition.sub(left2)
//         // //targetPosition.add(forward.setLength(5))
//         // const lookAtPoss = this.target.position.clone()
//         // //lookAtPoss.add(new THREE.Vector3(0,4,0));
//         // //console.log(targetPosition);
//         // targetPosition.add(offset)
//         // // camera collision
//         // const raycaster = this.raycaster;

//         // const startPoint = this.target.position.clone()
//         // const endPoint = targetPosition.clone()
//         // const bobbingOffset = new THREE.Vector3(0, Math.sin(this.timeElapsed * 3.0) * 0.04, 0);
//         // const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
//         // raycaster.set(startPoint, direction);
//         // const objectsToCheck = this.component.parent.scene.children;
//         // const intersections = raycaster.intersectObjects(objectsToCheck, true);
//         // let corrected  = targetPosition.add(bobbingOffset);
//         // if (intersections?.length) {
//         //     corrected = (intersections[0].point.distanceTo(startPoint) < endPoint.distanceTo(startPoint)) ? intersections[0].point : corrected
//         // }

//         // if (needToSlerp) {
//         //     const qx = new THREE.Quaternion()
//         //     qx.setFromAxisAngle(new THREE.Vector3(0,1,0), padData.phi)
      
//         //     this.target.quaternion.slerp(qx,slerpFactor)
//         // }
        
        
//         // lookAtPoss.add(offset2)
//         // this.camera.position.lerp(corrected,t);
//         // this.camera.lookAt(lookAtPoss)
//         // this.lookAt.copy(lookAtPoss)
//     }
//     beforeUpdate(vec){
//         return vec
//     }
// }