import { World } from './World';
import { Time } from './Time';
import { Communicator } from './Bus';
import type { Events } from './Events';
import { Physics, type PhysicsEngine } from './Physics';

export class ECS {
  static instance: ECS;

  readonly world: World;
  readonly time: Time;
  readonly bus: Communicator<Events>;
  readonly Physics: PhysicsEngine; // Placeholder for the physics engine

  constructor(physicsEngine:PhysicsEngine) {
    this.world = new World();
    this.time = new Time();
    this.bus = new Communicator();
    this.Physics = physicsEngine;



    ECS.instance = this; // Singleton
  }

  update(rawDelta: number) {
    this.time.update(rawDelta);
    this.world.update();
    Physics.update(this.Physics.world, this.time.deltaTime)
  }
}


export function bootstrap(p:PhysicsEngine,f:()=>void) {
  let lastTime = performance.now();

  const ecs = new ECS(p);

  f() // init fn 

  function tick(now: number) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    ecs.update(delta);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return ecs;
}