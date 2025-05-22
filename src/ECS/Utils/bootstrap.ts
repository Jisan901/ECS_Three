import { World } from './World';
import {Time} from './Time';
import { Communicator } from './Bus';
import type { Events } from './EventsGraph';

export class ECS {
  static instance: ECS;

  readonly world: World;
  readonly time: Time;
  readonly bus:Communicator<Events>;

  constructor() {
    this.world = new World();
    this.time = new Time();
    this.bus = new Communicator();

    ECS.instance = this; // Singleton
  }

  update(rawDelta: number) {
    this.time.update(rawDelta);
    this.world.update(this.time.deltaTime);
  }
}
