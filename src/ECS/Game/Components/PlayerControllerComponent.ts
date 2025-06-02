import type { Object3D, Vector3 } from "three";
import { Types, type Component, type ComponentTypeId } from "../../Utils/Types";

  
export type PlayerController = Component & {
  target: Object3D;
  springArmLength: number;
  targetOffset: Vector3;
  socketOffset: Vector3;
  maxLengthMultiplier: number;
  runSpeedMultiplier: number;
  walkSpeedMultiplier: number;
  airSpeedMultiplier: number;
  groundSpeedMultiplier: number;
  moveVector:Vector3;
  nextPos:Vector3;
};
export const PlayerController = {
  _type: Types.PlayerController as ComponentTypeId,
  defaults:{
    springArmLength: 6,
    maxLengthMultiplier: 25,
  }
};
