import { Types, type Component, type ComponentTypeId } from "../../Utils/Types";
import type { Terrain } from "../Utils/Terrain";
  
export type TerrainComponent = Component & {
  terrain: Terrain;
};
export const TerrainComponent = {
  _type: Types.TerrainComponent as ComponentTypeId,
};
