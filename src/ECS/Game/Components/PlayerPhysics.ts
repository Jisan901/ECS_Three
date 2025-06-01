// src/Components/Physics.ts
import type { Vector3 } from 'three';
import type { RigidBody, Collider, KinematicCharacterController, ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d';
import type { Component, ComponentTypeId } from '../../Utils/Types';
import { Types } from '../../Utils/Types';

export type PlayerPhysics = Component & {
  rigidBodyDesc: RigidBodyDesc;
  colliderDesc: ColliderDesc;
  rigidBody?: RigidBody;
  collider?: Collider;
  controller?: KinematicCharacterController;
  velocity: Vector3;
  isJumping: boolean;
  isGrounded: boolean;
  verticalVelocity: number;
  jumpVelocity: number;
  maxJumpHeight: number;
};

export const PlayerPhysics = {
  _type: Types.PlayerPhysics as ComponentTypeId,
};
