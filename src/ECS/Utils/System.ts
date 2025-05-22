import type * as ECS from "./World";

export interface System {
    name: string;
    onStart?(world: ECS.World): void;
    update(world: ECS.World, delta: number): void;
    onDestroy?(world: ECS.World): void;
  }
  