import {Component, MainLoop} from "../Component.ts"
import * as THREE from 'three';
import type { Collider, Quaternion, RigidBody, Vector3 } from "@dimforge/rapier3d";
import type World from "./World.ts";



export default class DynamicObject extends Component{
    public position:THREE.Vector3
    public mesh?: THREE.Mesh;
    public rigidBody?:RigidBody;
    public collider?:Collider;
    constructor(name:string,position:THREE.Vector3){
        super(name);
        this.position = position;
    }
    start(){
        const {RAPIER, world} = (this.root as MainLoop).initials;
        const parent = this.parent as World;
        let scene = parent?.scene;
        
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial({map: new THREE.TextureLoader().load('/public/prototype_512x512_green3.png')}));
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        
        //console.log(this.mesh)
        scene?.add(this.mesh)
        this.mesh.layers.enable( 3 );
        
        //this.mesh.geometry.scale(5,5,5)
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(this.position.x, this.position.y, this.position.z)
        let rigidBody = world.createRigidBody(bodyDesc);
        this.rigidBody = rigidBody;
        const colliderDesc = RAPIER.ColliderDesc.cuboid(1,1,1)
        .setMass(80);
        let collider = world.createCollider(colliderDesc, rigidBody);
        this.collider = collider;
        
        
    }
    repeat(){
        const position = (this?.rigidBody?.translation() as Vector3);
        const rotation = (this?.rigidBody?.rotation() as Quaternion);
        (this.mesh as THREE.Mesh).position.x = position.x;
        (this.mesh as THREE.Mesh).position.y = position.y;
        (this.mesh as THREE.Mesh).position.z = position.z;
        (this.mesh as THREE.Mesh).setRotationFromQuaternion(new THREE.Quaternion(
            rotation.x,
            rotation.y,
            rotation.z,
            rotation.w
            ));
    }
}