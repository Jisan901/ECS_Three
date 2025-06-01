import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import { Vector3, Quaternion } from 'three';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Physics } from '../Components/Physics';
import type { Renderable } from '../Components/Renderable';

export class PhysicsSystem implements System {
    entities: EntityId[] = [];
    name = 'PhysicsSystem';
    private ecs: ECS;

   
    constructor() {
        this.ecs = ECS.instance;

        this.onStart()
    }

    onStart() {
        // Initialize physics entities
        this.query();
        this.entities.forEach(this.createPhysicsBody.bind(this));
    }

    query() {
        this.entities = this.ecs.world.getEntitiesWith(Types.Renderable,Types.Physics);
    }

    update() {
        // Sync physics transforms with ECS components
        this.syncTransforms();
    }

    private syncTransforms() {
        this.entities.forEach(entity => {
            const physics = this.ecs.world.getComponent<Physics>(entity, Types.Physics);
            const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
            const body = physics?.body;

            if (!body || !renderable?.mesh) return;

            // Update ECS renderable.mesh from physics body
            const position = body.translation();
            const rotation = body.rotation();
            
            renderable.mesh.position.set(position.x, position.y, position.z);
            renderable.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }

    

    public findEntityByHandle(handle: number): EntityId | undefined {
        return this.entities.find(entity => {
            const physics = this.ecs.world.getComponent<Physics>(entity, Types.Physics);
            return physics?.body?.handle === handle;
        });
    }

    // Entity lifecycle management
    onEntityAdded = (entity: EntityId) => this.createPhysicsBody(entity);
    onEntityRemoved = (entity: EntityId) => this.destroyPhysicsBody(entity);

    private createPhysicsBody(entity: EntityId) {
        console.log(this);
        
        const physics = this.ecs.world.getComponent<Physics>(entity, Types.Physics);
        const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
        
        if (!physics || !this.ecs.Physics.world) return;

        


        // Create rigid body using ECS singleton's physicsWorld
        const bodyDesc = physics.bodyDesc;
        let body = physics.body

        if (bodyDesc) {
            bodyDesc.setLinearDamping(physics.linearDamping || 0.1);
            bodyDesc.setAngularDamping(physics.angularDamping || 0.1);
            bodyDesc.setGravityScale(physics.gravityScale || 1.0);
            body = this.ecs.Physics.world.createRigidBody(bodyDesc);
        }
        
 
        // Initialize position/orientation
        if (renderable?.mesh && body) {
            body.setTranslation(new Vector3(
                renderable?.mesh.position.x,
                renderable?.mesh.position.y,
                renderable?.mesh.position.z
            ), true);
            
            body.setRotation(new Quaternion(
                renderable?.mesh.quaternion.x,
                renderable?.mesh.quaternion.y,
                renderable?.mesh.quaternion.z,
                renderable?.mesh.quaternion.w
            ), true);
        }

        let collider = physics.collider;
        if (!collider&&physics.colliderDesc){
            // Create collider
            // physics.colliderDesc.setTranslation(
            //     renderable?.mesh.position.x??0,
            //     renderable?.mesh.position.y??0,
            //     renderable?.mesh.position.z??0
            // );
            // physics.colliderDesc.setRotation(new Quaternion(
            //     renderable?.mesh.quaternion.x??0,
            //     renderable?.mesh.quaternion.y??0,
            //     renderable?.mesh.quaternion.z??0,
            //     renderable?.mesh.quaternion.w??1
            // ));
            
            collider = this.ecs.Physics.world.createCollider(
                physics.colliderDesc, 
                body
            )
        }

        // Store reference in component
        physics.body = body;
        physics.collider = collider;
    }



    private destroyPhysicsBody(entity: EntityId) {
        const physics = this.ecs.world.getComponent<Physics>(entity, Types.Physics);
        if (!physics?.body || !this.ecs.Physics.world) return;

        this.ecs.Physics.world.removeRigidBody(physics.body);
        delete physics.body;
        delete physics.collider;
    }

    onDestroy() {
        // Cleanup through singleton reference
        this.entities.forEach(this.destroyPhysicsBody);
    }
}