// src/Entities/Player.ts
import * as THREE from 'three/webgpu';
import { ECS } from '../../Utils/bootstrap';
import { Renderable } from '../Components/Renderable';
import { Vector3 } from 'three';
import { PlayerPhysics } from '../Components/PlayerPhysics';
import { PlayerController } from '../Components/PlayerControllerComponent';
import { Animation } from '../Components/Animation';
import { createPlayerAnimation } from '../AnimationMaps/PlayerAnimation';

export default () => {
  const PLAYER_HEIGHT = 5;
  const PLAYER_WIDTH = 1;
  const entity = ECS.instance.world.createEntity();

  const { RAPIER } = ECS.instance.Physics;

  // Create RigidBody & Collider Descriptors
  const characterDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 10, 0);
  const characterColliderDesc = RAPIER.ColliderDesc.capsule(PLAYER_WIDTH, PLAYER_HEIGHT / 2).setMass(50);


  // Create Mesh
  const characterColliderMesh = new THREE.Object3D()||new THREE.Mesh(
    new THREE.CapsuleGeometry(PLAYER_WIDTH, PLAYER_HEIGHT),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  //characterColliderMesh.visible = false
  // animated mesh
  const assets = ECS.instance.assetManager.getAssets<{
    character: THREE.Object3D;
    animations: Record<string,THREE.Object3D>
  }>(1)
  const character = assets['character'];
  character.scale.setScalar(0.04)
  character.position.setY(-3.5)
  characterColliderMesh.add(character)

  //animation
  const mixer = new THREE.AnimationMixer(character);
  const animations = assets['animations'];
  const actionMap = {
    idle: mixer.clipAction(animations['idle'].animations[0]),
    walk: mixer.clipAction(animations['walk'].animations[0]),
    run: mixer.clipAction(animations['run'].animations[0]),
    falling: mixer.clipAction(animations['falling'].animations[0]),
  }




  // Add Components
  ECS.instance.world.addComponent<Renderable>(entity, {
    __type: Renderable._type,
    mesh: characterColliderMesh,
  });
  ECS.instance.world.addComponent<Animation>(entity, {
    __type: Animation._type,
    mesh: character,
    mixer,
    animationMap: createPlayerAnimation(actionMap),
  });
  ECS.instance.world.addComponent<PlayerController>(entity, {
    __type: PlayerController._type,
    target: characterColliderMesh,
    ...PlayerController.defaults,
    targetOffset: new Vector3(),
    socketOffset: new Vector3(),
    moveVector: new Vector3(),
    nextPos: new Vector3()
  });
  ECS.instance.world.addComponent<PlayerPhysics>(entity, {
    __type: PlayerPhysics._type,
    colliderDesc:characterColliderDesc,
    rigidBodyDesc: characterDesc,
    velocity: new Vector3(),
    isGrounded: true,
    isJumping: false,
    jumpVelocity: 0.4,
    verticalVelocity: -0.8,
    maxJumpHeight: 10,
  });

  return entity;
};
