import type { AnimationMixer, Object3D } from "three";
import { Types, type Component, type ComponentTypeId } from "../../Utils/Types";
import type { FiniteStateMachine } from "../../../Application/Game/Utils/FSM";

  
export type Animation = Component & {
  mesh: Object3D;
  animationMap: FiniteStateMachine<any,any>;
  mixer: AnimationMixer
};

export const Animation = {
  _type: Types.Animation as ComponentTypeId,
};
