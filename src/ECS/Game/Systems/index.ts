import { PhysicsSystem } from "./Physics";
import { PlayerControllerSystem } from "./PlayerControllerSystem";
import { PlayerInputSystem } from "./PlayerInput";
import { PlayerPhysicsSystem } from "./PlayerPhysics";
import { RenderingSystem } from "./Rendering";

export const Systems = [PhysicsSystem, RenderingSystem, PlayerInputSystem, PlayerPhysicsSystem, PlayerControllerSystem]