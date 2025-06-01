import * as THREE from 'three';
import { ECS } from '../../Utils/bootstrap';
import { Types } from '../../Utils/Types';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';
import type { PlayerPhysics } from '../Components/PlayerPhysics';
import type { PlayerController } from '../Components/PlayerControllerComponent';

function resetTransform(obj: THREE.Object3D) {
    obj.position.set(0, 0, 0);
    obj.quaternion.identity();
    obj.scale.set(1, 1, 1);
    obj.updateMatrixWorld(true);
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export class PlayerControllerSystem implements System {
    entities: EntityId[] = [];
    name = 'PlayerControllerSystem';
    ecs = ECS.instance;

    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster;
    // private lookAt = new THREE.Vector3();
    private camera_holder = new THREE.Object3D();
    private camera_holder_pawn = new THREE.Object3D();
    private previousArmLen = 6;
    private timeElapsed = 0;
    constructor() {
        this.camera = ECS.instance.Rendering.camera;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(3);
        resetTransform(this.camera);
        this.camera.rotation.y = -Math.PI;
        this.camera_holder.add(this.camera);
        this.camera_holder_pawn.add(this.camera_holder);
        this.onStart();
    }

    onStart() {
        this.query();
    }

    query() {
        this.entities = this.ecs.world.getEntitiesWith(Types.PlayerPhysics, Types.PlayerController, Types.Renderable);
    }

    update() {
        const delta = ECS.instance.time.deltaTime;
        this.timeElapsed += delta;
        const smoothFactor = 1.0 - Math.pow(0.001, delta);
        for (const entity of this.entities) {
            const physics = this.ecs.world.getComponent<PlayerPhysics>(entity, Types.PlayerPhysics);
            const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
            const controller = this.ecs.world.getComponent<PlayerController>(entity, Types.PlayerController);
            if (!(renderable&&physics&&controller)) return
                
            const target = renderable.mesh;
            const padState = this.ecs.Input;
            const padData = padState;

            
            const speedFactor = padData.buttons.autoSwitch.switch ? 6 : 0;

            
            const needTolerp = Math.abs(controller.moveVector.length()) > 0.001;

            // if (padData.left || padData.right) {
            //     padData.rotationPad.setPhiTheta(-delta * hudData.deltaX, 0);
            // }

          
            const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), padData.phi);
            const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -padData.theta);
            const targetQuat = qx.clone().multiply(qy);

            if (needTolerp) {
                target.quaternion.slerp(qx, smoothFactor);
            }

            const armLength = lerp(this.previousArmLen, 6 + speedFactor, smoothFactor);
            this.previousArmLen = armLength;

            const cameraTarget = target.position.clone().add(new THREE.Vector3(0, 3, 0));
            const armVector = new THREE.Vector3(0, 0, -armLength).applyQuaternion(targetQuat);
            this.camera_holder_pawn.position.lerp(cameraTarget.clone().add(armVector), smoothFactor);
            this.camera_holder.position.copy(new THREE.Vector3(-1, 0, 0));
            this.camera_holder_pawn.lookAt(cameraTarget);
            this.camera_holder_pawn.updateMatrixWorld(true);
        }
    }
}
