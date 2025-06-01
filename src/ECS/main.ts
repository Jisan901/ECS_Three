import { Game } from "./Game/Game";
import { bootstrap } from "./Utils/bootstrap";
import { Physics } from "./Utils/Physics";


(async ()=>{
    const p = await Physics.init()
    bootstrap(p,()=>{
        new Game()
    });

})()
