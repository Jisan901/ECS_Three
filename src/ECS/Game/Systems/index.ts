import { AnimationSystem } from "./Animation";
import { GUIDebugSystem } from "./GUIDebug";
import { PhysicsSystem } from "./Physics";
import { PlayerControllerSystem } from "./PlayerControllerSystem";
import { PlayerInputSystem } from "./PlayerInput";
import { PlayerPhysicsSystem } from "./PlayerPhysics";
import { RenderingSystem } from "./Rendering";
import { TerrainSystem } from "./TerrainSystem";

export const Systems = [PhysicsSystem, RenderingSystem, PlayerInputSystem, PlayerPhysicsSystem, PlayerControllerSystem, AnimationSystem, TerrainSystem, GUIDebugSystem];