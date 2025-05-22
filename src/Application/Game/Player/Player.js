import { Component } from "../../Component.ts"
import * as THREE from 'three';
import playerProps from './player.json'
import { PlayerEntity, PlayerInputSystem, PlayerController, FPSPlayerEntity } from './PlayerEntity.js';

import Physics from './Physics.js'

export default class Player extends Component {
    constructor(name) {
        super(name);
    }
    start() {

        this.physics = new Physics('playerPhysics');
        this.addComponent(this.physics);
        const { application, game, camera } = this.root.initials;
        this.camera = camera
        



        this.scene = this.parent.scene;
        const scene = this.scene;
        const {character,animations, item} = application.assetManager.assets[1];
        character.userData.animations = animations;
        this.spawnPosition = new THREE.Vector3(0, 0, 0);

        const capGeo = new THREE.CapsuleGeometry(game.constants.PLAYER_WIDTH, game.constants.PLAYER_HEIGHT);
        const capMat = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true });
        const playerOuterMesh = new THREE.Mesh(capGeo, capMat);

        const texture = new THREE.TextureLoader().load('/public/prototype_512x512_blue3.png')
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(200,200)

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000) ,new THREE.MeshStandardMaterial({map:texture, side:THREE.DoubleSide}))
        plane.receiveShadow = true
        //plane.castShadow
        character.traverse(e=>{
            if (e.isMesh) {
                e.castShadow = true
                e.receiveShadow = true
            }
        })
        plane.rotation.x = -Math.PI / 2
        scene.add(plane)
        plane.position.set(0,0.01,0)
        playerOuterMesh.position.set(0, 2, 0)
        character.castShadow = true
        scene.add(playerOuterMesh);
       
        const playerEntity = new PlayerEntity(
            playerProps,
            character
        )
        this.playerEntity = playerEntity;



        this.playerEntity.spawn(this.spawnPosition, scene)
        this.fbx = playerEntity.mesh;
        this.fbx.scale.setScalar(0.03)
        this.fbx.rotation.set(0, Math.PI, 0)




        

        playerOuterMesh.visible = false


        this.fbx.position.set(0,-2.5,0)
        playerEntity.mesh.parent = playerOuterMesh;
       
        playerEntity.controller = new PlayerController(playerEntity, camera, playerOuterMesh, this);
        playerEntity.controller.inputSystem = new PlayerInputSystem(playerEntity.controller, game.gamePad);
        playerEntity.pickHelper = new PickHelper(scene, camera)
        playerEntity.controller.beforeUpdate = this.updatePosition.bind(this);




    }
    updatePosition(nextPos) {
        return this.physics.updatePosition(nextPos);
    }
    repeat(t) {
        this.playerEntity.update(t);
        
    }
}

class PickHelper {
    constructor(scene, camera) {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.set(2);
        this.intersections = null;
        this.scene = scene;
        this.camera = camera;
        this.far = 15
    }
    pick(i) {
        this.raycaster.layers.set(i || 2);
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        this.raycaster.far = this.far;
        const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
        if (intersectedObjects.length) {
            this.intersections = intersectedObjects;
            return this.intersections
        }
    }
}