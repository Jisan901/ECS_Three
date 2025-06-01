import { ECS } from "../Utils/bootstrap";
import {Entities} from "./Entities";
import { Systems } from "./Systems";
import UI from '../../Application/UserInterface';
import { LightGamePad } from '../../Application/Utils/GamePad';

export class Game {
    public entitiesCreator: (()=>void)[];
    public ecs: ECS;
    readonly ui: UI;
    readonly gamePad: LightGamePad;
    
    constructor() {
        this.entitiesCreator = Entities;
        this.ecs = ECS.instance;
        this.ui = new UI(ECS.instance.bus);
        this.ui.wrapper.appendChild(this.ecs.Rendering.renderer.domElement)
        this.ui.init()
        
        this.gamePad = new LightGamePad(this.ui.components['hud'].dom as HTMLElement, this.ecs.Input)
        this.gamePad.setup(this.gamePad.dom)
        this.ecs.bus.emit('setGamePadVisibility', {visible:true})
        this.init();
    }
    async init() {
        await this.ecs.assetManager.loadLevel(1)
        this.entitiesCreator.forEach(e=>{
            e()
        })
        Systems.forEach(e=>{
            ECS.instance.world.registerSystem(new e())
        })
        this.gamePad.alignPads()
    }
}

// register everything on index.ts
/*

    ./Entities/index.ts -> entity creator function: that will add component as needed
    ./Components/index.ts
    ./System/index.ts

*/