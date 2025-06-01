// src/Systems/PhysicsSystem.ts
import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';
import type { PlayerPhysics } from '../Components/PlayerPhysics';
import type { PlayerController } from '../Components/PlayerControllerComponent';

export class PlayerPhysicsSystem implements System {
  entities: EntityId[] = [];
  name = 'PlayerPhysicsSystem';
  private ecs: ECS;

  constructor() {
    this.ecs = ECS.instance;
    this.onStart();
  }

  onStart() {
    this.query();
    this.entities.forEach(this.createPhysicsBody.bind(this));
  }

  query() {
    this.entities = this.ecs.world.getEntitiesWith(Types.Renderable, Types.PlayerPhysics);
  }

  update() {
    this.entities.forEach(this.updateEntity.bind(this))
    this.syncTransforms();
  }
  updateEntity(entity: EntityId) {
    const physics = this.ecs.world.getComponent<PlayerPhysics>(entity, Types.PlayerPhysics);
    const moveController = this.ecs.world.getComponent<PlayerController>(entity, Types.PlayerController);
    if (!(physics&&moveController)) return;

    const controller = physics.controller;
    const collider = physics.collider;
    const rigidBody = physics.rigidBody;
    if (!(controller&&rigidBody&&collider)) return
    let moveVector = moveController?.moveVector.clone();
    physics.isGrounded = controller.computedGrounded();

    ECS.instance.Global.isGrounded = physics.isGrounded;
    
    if (physics.isGrounded) {
      if (physics.isJumping) {
        physics.maxJumpHeight -= physics.jumpVelocity;
        physics.verticalVelocity = physics.jumpVelocity;
        if (physics.maxJumpHeight < 1) {
          physics.isJumping = false;
        }
      }
      else{
        physics.verticalVelocity = 0;
      }
    } else {
      if (physics.isJumping) {
        physics.maxJumpHeight -= physics.jumpVelocity;
        if (physics.maxJumpHeight < 1 ) {
          physics.isJumping = false;
          physics.verticalVelocity = -0.5;
        }
      }
      else {
        physics.verticalVelocity -= this.ecs.time.deltaTime * 9.8;
      }
    }

    moveVector.y = physics.verticalVelocity;

    controller?.computeColliderMovement(collider, moveVector);
    const correctedMovement = controller.computedMovement();
    const newPos = rigidBody.translation();

    newPos.x += correctedMovement.x;
    newPos.y += correctedMovement.y;
    newPos.z += correctedMovement.z;

    rigidBody.setNextKinematicTranslation(newPos);
    physics.velocity.copy(rigidBody.linvel());
    
    moveController.nextPos.copy(newPos)
  }

  syncTransforms() {
    for (const entity of this.entities) {
      const physics = this.ecs.world.getComponent<PlayerPhysics>(entity, Types.PlayerPhysics);
      const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
      const moveController = this.ecs.world.getComponent<PlayerController>(entity, Types.PlayerController);
      const rb = physics?.rigidBody;

      if (!rb || !renderable || !moveController) continue;

      //const pos = rb.translation();
      //const rot = rb.rotation();

      renderable.mesh.position.lerp(moveController.nextPos,1.0 - Math.pow(0.001, this.ecs.time.deltaTime));
      //renderable.mesh.position.add(moveController.moveVector);
      //renderable.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  }

  createPhysicsBody(entity: EntityId) {
    const { RAPIER, world } = this.ecs.Physics;
    const physics = this.ecs.world.getComponent<PlayerPhysics>(entity, Types.PlayerPhysics);

    if (!physics) return 

    const rbDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 20, 0);
    const rb = world.createRigidBody(rbDesc);

    const colliderDesc = physics.colliderDesc;

    const collider = world.createCollider(colliderDesc, rb);

    const controller = world.createCharacterController(0.001);
    controller.setCharacterMass(30);
    controller.enableAutostep(0.07, 0.03, true);
    controller.enableSnapToGround(0.07);
    controller.setApplyImpulsesToDynamicBodies(true);
    
    physics.rigidBody = rb;
    physics.collider = collider;
    physics.controller = controller;

    this.ecs.Input.buttons.spacePressed.onClick = ()=>{
            if (physics.isGrounded) {
                physics.jumpVelocity = 0.4;
                physics.isJumping = true;
                physics.maxJumpHeight = 10;
            }
        }
  }
}
