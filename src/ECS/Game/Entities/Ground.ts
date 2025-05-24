import * as THREE from 'three/webgpu'

import { ECS } from "../../Utils/bootstrap";
import { Renderable } from "../Components/Renderable";
import { Physics } from '../Components/Physics';

export default ()=>{
    const ground = ECS.instance.world.createEntity()
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshStandardMaterial({color: 0x00ff00})
    )
    mesh.rotation.x = -Math.PI / 2; 



    const colliderDesc = ECS.instance.Physics.RAPIER.ColliderDesc.cuboid(1000.0, 0.01, 1000.0)
        .setTranslation(0,0,0)
        
    ECS.instance.world.addComponent<Renderable>(ground,{__type:Renderable._type, mesh });
    ECS.instance.world.addComponent<Physics>(ground,{__type:Physics._type,colliderDesc})
}
