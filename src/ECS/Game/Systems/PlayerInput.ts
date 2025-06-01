import * as THREE from 'three';
import { ECS } from '../../Utils/bootstrap';
import { Types } from '../../Utils/Types';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';
import type { PlayerPhysics } from '../Components/PlayerPhysics';
import type { PlayerController } from '../Components/PlayerControllerComponent';


export class PlayerInputSystem implements System {
    entities: EntityId[] = [];
    name = 'PlayerInputSystem';
    ecs = ECS.instance;

    private timeElapsed = 0;
   
    constructor() {
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
        for (const entity of this.entities) {
            const physics = this.ecs.world.getComponent<PlayerPhysics>(entity, Types.PlayerPhysics);
            const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
            const controller = this.ecs.world.getComponent<PlayerController>(entity, Types.PlayerController);
            if (!(renderable&&physics&&controller)) return
                
            const target = renderable.mesh;
            const padState = this.ecs.Input;
            const hudData = padState.hudData;
            const padData = padState;

            const grounded = physics.isGrounded;
            const speed = grounded ? 6 : 12;
            const speedFactor = padData.buttons.autoSwitch.switch ? 6 : 0;

            const moveX = hudData.deltaX * delta * speed;
            const moveZ = (hudData.deltaY * delta * speed) + (speedFactor * delta * 5.0);

            const forward = target.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
            const left = new THREE.Vector3().crossVectors(forward, target.up).normalize();
            const moveVector = new THREE.Vector3()
                .addScaledVector(left, -moveX)
                .addScaledVector(forward, moveZ);

            controller.moveVector.copy(moveVector); // it will used in pysics
        }
    }
}
