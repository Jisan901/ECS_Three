import UI from "../../Application/UserInterface";
import { ECS } from "../Utils/bootstrap";
import {Entities} from "./Entities";
import { Systems } from "./Systems";

export class Game {
    public entitiesCreator: (()=>void)[];
    public ecs: ECS;
    public ui: UI;
    constructor() {
        this.entitiesCreator = Entities;
        this.ecs = ECS.instance;
        this.ui = new UI(ECS.instance.bus);
        this.ui.wrapper.appendChild(this.ecs.Rendering.renderer.domElement)
        console.log(ECS.instance);

        this.init();
    }
    async init() {
        this.ui.init()
        await this.ecs.assetManager.loadLevel(1)
        this.entitiesCreator.forEach(e=>{
            e()
        })
        Systems.forEach(e=>{
            ECS.instance.world.registerSystem(new e())
        })
        console.log(ECS.instance);
        
    }
}

// register everything on index.ts
/*

    ./Entities/index.ts -> entity creator function: that will add component as needed
    ./Components/index.ts
    ./System/index.ts

*/