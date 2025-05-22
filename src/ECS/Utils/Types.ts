export interface Component {
  __type: ComponentTypeId;
}


export const Types = {
    Transform: 0,
    Renderable: 1,
    Rigidbody: 2,
    Collider: 3,
    Health: 4,
    Input: 5,
    Sound: 6,
    Network: 7,
    Position: 8,
    Velocity:9
  };
  
export type ComponentTypes = keyof typeof Types;
export type ComponentTypeId = typeof Types[ComponentTypes]; // 0–7


export type Position = Component & { x: number; y: number };
export const Position = {
    _type: Types.Position as ComponentTypeId
  };
  

  export type Velocity = Component & { dx: number; dy: number };
  export const Velocity = {
    _type: Types.Velocity as ComponentTypeId
  };
  
