import * as THREE from 'three/webgpu'

import { ECS } from "../../Utils/bootstrap";
import { Renderable } from "../Components/Renderable";
import { Physics } from '../Components/Physics';

export default ()=>{
    const ground = ECS.instance.world.createEntity()
    const texture = new THREE.TextureLoader().load('/public/prototype_512x512_blue3.png')
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat = new THREE.Vector2(20,20)
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({color: 0xffffff, map:texture})
    )
    mesh.geometry.rotateX(-Math.PI / 2)



    const colliderDesc = ECS.instance.Physics.RAPIER.ColliderDesc.cuboid(100.0, 1, 100.0)
        .setTranslation(0,0,0)
        
    ECS.instance.world.addComponent<Renderable>(ground,{__type:Renderable._type, mesh });
    ECS.instance.world.addComponent<Physics>(ground,{__type:Physics._type,colliderDesc})
}
