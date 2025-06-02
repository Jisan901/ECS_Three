import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { PlayerController } from '../Components/PlayerControllerComponent';

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

  }
  // dController(entity:EntityId){
  //   const controller = this.ecs.world.getComponent<PlayerController>(entity, Types.PlayerController);
  //   if (!controller) return;
  //   const folder = this.ecs.lil.addFolder(`Controller ${entity}`);
  //   folder.add(controller, 'walkSpeedMultiplier', 0, 10).name('Walk Speed Multiplier');
  //   folder.add(controller, 'runSpeedMultiplier', 0, 10).name('Run Speed Multiplier');
  //   folder.add(controller, 'airSpeedMultiplier', 0, 10).name('Air Speed Multiplier');
  //   folder.add(controller, 'groundSpeedMultiplier', 0, 10).name('Ground Speed Multiplier');
  //   folder.add(controller, 'springArmLength', 0, 20).name('Spring Arm Length');
  //   folder.add(controller, 'maxLengthMultiplier', 0, 20).name('Max Arm Length');
  //   // vecs
  //   folder.add(controller.targetOffset, 'x', -10, 10).name('Target Offset X');
  //   folder.add(controller.targetOffset, 'y', -10, 10).name('Target Offset Y');
  //   folder.add(controller.targetOffset, 'z', -10, 10).name('Target Offset Z');
  //   folder.add(controller.socketOffset, 'x', -10, 10).name('Socket Offset X');
  //   folder.add(controller.socketOffset, 'y', -10, 10).name('Socket Offset Y');
  //   folder.add(controller.socketOffset, 'z', -10, 10).name('Socket Offset Z');
  // }
  update() {
    
  }

  onDestroy() {
    // Optional cleanup
  }
}
