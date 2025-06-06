import { Types } from '../../Utils/Types';
import { ECS } from '../../Utils/bootstrap';
import type { System } from '../../Utils/System';
import type { EntityId } from '../../Utils/World';
import type { TerrainComponent } from '../Components/Terrain';


export class TerrainSystem implements System {
    entities: EntityId[] = [];
    name = 'TerrainSystem';
    private ecs: ECS;


    constructor() {
        this.ecs = ECS.instance;
       
        

        this.onStart()
    }

    onStart() {
        // Initialize scene
        this.query();
        
    }

    query() {
        this.entities = this.ecs.world.getEntitiesWith(Types.TerrainComponent);
    }

   
    update() {
        this.entities.forEach(e=>{
            const terrain = this.ecs.world.getComponent<TerrainComponent>(e,Types.TerrainComponent)
            if(terrain) terrain.terrain.update()
        })
    }

    onDestroy() {
        // Cleanup through singleton reference
        
    }
}
