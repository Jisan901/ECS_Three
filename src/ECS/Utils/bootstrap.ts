import { World } from './World';
import { Time } from './Time';
import { Communicator } from './Bus';
import type { Events } from './Events';
import { Physics, type PhysicsEngine } from './Physics';
import type { Rendering } from './Rendering';
import setUpThree from './Rendering';
import AssetManager from '../../Application/AssetManager';
import { InputData } from '../../Application/Utils/GamePad';
import { Debug } from './Debug';
import GUI from 'lil-gui';
import { Global } from './Global';

export class ECS {
  static instance: ECS;

  readonly world: World;
  readonly time: Time;
  readonly bus: Communicator<Events>;
  readonly Rendering :Rendering;
  readonly Physics: PhysicsEngine; // Placeholder for the physics engine
  readonly assetManager: AssetManager;
  readonly Input:InputData;
  readonly dev:Debug;
  readonly lil:GUI;
  readonly Global:Global;
  
  constructor(physicsEngine:PhysicsEngine) {
    this.dev = new Debug()
    this.lil = new GUI()
    this.Global = new Global();
    this.world = new World();
    this.time = new Time();
    this.bus = new Communicator();
    this.Rendering = setUpThree();
    this.assetManager = new AssetManager(this.bus)
    this.Input = new InputData()
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
  ecs.Global._useGUIDebug();
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