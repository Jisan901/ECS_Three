import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';
import * as THREE from 'three/webgpu'


export class RenderingSystem implements System {
    entities: EntityId[] = [];
    name = 'RenderingSystem';
    private ecs: ECS;
    private scene:THREE.Scene;
   
    constructor() {
        this.ecs = ECS.instance;
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.onStart()
    }

    onStart() {
        // Initialize scene
        this.query();
        this.entities.forEach(e=>{
            this.addToScene(e)
        })
    }

    query() {
        this.entities = this.ecs.world.getEntitiesWith(Types.Renderable);
    }

    addToScene(entity:EntityId){
        const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
        if(!renderable?.mesh) return;
        this.scene.add(renderable?.mesh)
    }

    update() {
        this.ecs.Rendering.render(this.scene)
    }

    onDestroy() {
        // Cleanup through singleton reference
        
    }
}