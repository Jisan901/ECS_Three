import { Types, type Component, type ComponentTypeId } from "../../Utils/Types";
import type { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier3d";
import type { Quaternion, Vector3 } from "three";

export type Physics = Component & {
  // Rigid Body Properties
  bodyDesc?: RigidBodyDesc;
  body?:RigidBody;
  mass?: number;
  position?: Vector3;
  rotation?: Quaternion;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
  ccdEnabled?: boolean;
  lockTranslations?: boolean;
  lockRotations?: boolean;
  enabledRotations?: [boolean, boolean, boolean]; // [x, y, z]
  enabledTranslations?: [boolean, boolean, boolean]; // [x, y, z]

  // Collider Properties
  colliderDesc?: ColliderDesc;
  collider?: Collider;
  friction?: number;
  restitution?: number;
  isSensor?: boolean;
  collisionGroups?: number;
  solverGroups?: number;
  contactForceEventThreshold?: number;
  
  // Advanced Dynamics
  centerOfMass?: Vector3;
  principalAngularInertia?: Vector3;
  angularInertiaLocal?: Quaternion;
  
  // Collision Filtering
  collisionMask?: number;
  collisionType?: 'static' | 'dynamic' | 'kinematic';
  

  // Debug
  debugColor?: number;
  showCollider?: boolean;
};

export const Physics = {
  _type: Types.Physics as ComponentTypeId,
  defaults: {
    mass: 1,
    linearDamping: 0.1,
    angularDamping: 0.1,
    gravityScale: 1.0,
    friction: 0.5,
    restitution: 0.2,
    isSensor: false,
    collisionType: 'dynamic',
    lockTranslations: false,
    lockRotations: false,
    enabledTranslations: [true, true, true],
    enabledRotations: [true, true, true],
    showCollider: false,
    ccdEnabled: false,
  }
};