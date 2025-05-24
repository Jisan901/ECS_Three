import type { ComponentTypeId } from "./Types";
import type * as ECS from "./World";

export interface System {
    entities: ECS.EntityId[];
    name: string;
    onStart?(): void;
    query:(types:ComponentTypeId[])=> void;
    update(): void;
    onDestroy?(): void;
  }
  