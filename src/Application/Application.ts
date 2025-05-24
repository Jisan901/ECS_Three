// Application.ts
import AssetManager from "./AssetManager";
import type UI from "./UserInterface";
import type Game from "./Game"; // Assuming Game is your controller class

class Application {
    public ui: UI;
    public controller: Game;
    public eventTarget: EventTarget;
    public assetManager: AssetManager;

    constructor(ui: UI, controller: Game, __eventTarget: EventTarget) {
        this.ui = ui;
        this.controller = controller;
        this.eventTarget = __eventTarget;
        this.assetManager = new AssetManager(__eventTarget);
    }

    async init(): Promise<void> {
        this.ui.init(this);
        await this.controller.init(this);
        await this.assetManager.loadLevel(1);
        this.eventTarget.dispatchEvent(new CustomEvent('startController'));
    }
}

export default Application;
