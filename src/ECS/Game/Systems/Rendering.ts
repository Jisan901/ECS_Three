import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';
import * as THREE from 'three/webgpu'
import type { World } from '@dimforge/rapier3d';


export class RenderingSystem implements System {
    entities: EntityId[] = [];
    name = 'RenderingSystem';
    private ecs: ECS;
    private scene:THREE.Scene;
    private directionalLight: THREE.DirectionalLight;
    private debug: boolean;
    private debugRenderer?: RapierDebugRenderer;

    meshes :THREE.Mesh[] = []
    constructor() {
        this.ecs = ECS.instance;
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.directionalLight = new THREE.DirectionalLight(0xF4E99B, 10);
        this.scene.add(this.directionalLight)
        
        this.debug = false;
        

        this.onStart()
    }

    onStart() {
        // Initialize scene
        this.query();
        this.entities.forEach(e=>{
            this.addToScene(e)
        })



        // let mesh = new THREE.Mesh(
        //         new THREE.BoxGeometry(5, 5, 5),
        //         new THREE.MeshStandardMaterial({color: 0xffffff})
        //   )
        //    mesh.occlusionTest = true
        //   mesh.position.set(15,2.5,0)
        // this.meshes.push(mesh)
        // mesh = new THREE.Mesh(
        //         new THREE.BoxGeometry(3, 3, 3),
        //         new THREE.MeshStandardMaterial({color: 0xff11ff})
        //   )
        //   mesh.occlusionTest = true
        //   mesh.position.set(5,1.5,0)
        // this.meshes.push(mesh)
        // this.scene.add(...this.meshes)

        if(this.debug){
            this.debugRenderer = new RapierDebugRenderer(this.scene, this.ecs.Physics.world)
            this.scene.children.forEach(e=>{
              if (!(e as THREE.Mesh).isMesh) return
              e.add(new THREE.AxesHelper(5))
            })
        }
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
        if(this.debug){
            this.debugRenderer?.update()
        }
        this.ecs.Rendering.render(this.scene)

     
        
    }

    onDestroy() {
        // Cleanup through singleton reference
        
    }
}

class RapierDebugRenderer {
  mesh
  world
  enabled = true

  constructor(scene: THREE.Scene, world: World) {
    this.world = world
    this.mesh = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }))
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = this.world.debugRender()
      this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      this.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
      this.mesh.visible = true
    } else {
      this.mesh.visible = false
    }
  }
}