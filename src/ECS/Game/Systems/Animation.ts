import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { Animation } from '../Components/Animation';

export class AnimationSystem implements System {
  entities: EntityId[] = [];
  name = 'AnimationSystem';
  private ecs: ECS;

  constructor() {
    this.ecs = ECS.instance;
    this.onStart();
  }

  onStart() {
    this.query();
  }

  query() {
    this.entities = this.ecs.world.getEntitiesWith(Types.Renderable, Types.Animation);
  }

  update() {
    this.entities.forEach(entity => {
      const animation = this.ecs.world.getComponent<Animation>(entity, Types.Animation);
      if (!animation) return;

      animation.mixer.update(this.ecs.time.deltaTime);
      animation.animationMap.update();
    });
  }

  onDestroy() {
    // Optional cleanup
  }
}
