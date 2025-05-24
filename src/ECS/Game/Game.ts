import { ECS } from "../Utils/bootstrap";
import {Entities} from "./Entities";
import { PhysicsSystem } from "./Systems/Physics";
export class Game {
    public entitiesCreator: (()=>void)[];
    public ecs: ECS;
    constructor() {
        this.init();
        this.entitiesCreator = Entities;
        this.ecs = ECS.instance;
    }
    init() {
        this.entitiesCreator.forEach(e=>{
            e()
        })
        ECS.instance.world.registerSystem(new PhysicsSystem())
    }
}

// register everything on index.ts
/*

    ./Entities/index.ts -> entity creator function: that will add component as needed
    ./Components/index.ts
    ./System/index.ts

*/