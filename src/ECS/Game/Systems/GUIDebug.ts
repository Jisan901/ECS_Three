import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Renderable } from '../Components/Renderable';

export class GUIDebugSystem implements System {
  entities: EntityId[] = [];
  name = 'GUIDebugSystem';
  private ecs: ECS;

  constructor() {
    this.ecs = ECS.instance;
    this.onStart();
  }

  onStart() {
    this.query();
    this.entities.forEach(this.initFolders.bind(this));
  }

  query() {
    this.entities = this.ecs.world.getEntitiesWith(Types.Renderable);
  }
  initFolders(entity:EntityId){
    const renderable = this.ecs.world.getComponent<Renderable>(entity, Types.Renderable);
    if (!renderable) return;

    const folder = this.ecs.lil.addFolder(`Entity ${entity}`);
    folder.add(renderable.mesh.position, 'x', -100, 100).name('Position X');
    folder.add(renderable.mesh.position, 'y', -100, 100).name('Position Y');
    folder.add(renderable.mesh.position, 'z', -100, 100).name('Position Z');
  }
  update() {
    
  }

  onDestroy() {
    // Optional cleanup
  }
}
