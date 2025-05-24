import type { Object3D } from "three";
import { Types, type Component, type ComponentTypeId } from "../../Utils/Types";

  
export type Renderable = Component & {
  mesh: Object3D;
  
};
export const Renderable = {
  _type: Types.Renderable as ComponentTypeId,
};
