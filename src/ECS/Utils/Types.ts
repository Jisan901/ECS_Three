
export interface Component {
  __type: ComponentTypeId;
}


export const Types = {
    Transform: 0,
    Renderable: 1,
    Physics: 2,
    Unknown: 3,
    Health: 4,
    Input: 5,
    Sound: 6,
    Network: 7,
    PlayerController:8,
    PlayerPhysics:9,
    Animation:10
  } as const;
  
export type ComponentTypes = keyof typeof Types;
export type ComponentTypeId = typeof Types[ComponentTypes];

