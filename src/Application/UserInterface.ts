import MainUI from './UI/main.ts';
import LoadingUi from "./UI/loading.ts";
import HudUi from "./UI/Hud.ts";
import type { Communicator } from '../ECS/Utils/Bus.ts';
import type { Events } from '../ECS/Utils/Events.ts';

type ComponentMap = Record<string, any>;

class UI {
    public bus: Communicator<Events>;
    public wrapper: HTMLElement;
    public components: ComponentMap;

    constructor(bus: Communicator<Events>) {
        this.bus = bus;
        const wrapperEl = document.getElementById('wrapper');
        if (!wrapperEl) {
            throw new Error("Element with id 'wrapper' not found");
        }
        this.wrapper = wrapperEl;
        document.body.onclick = () => document.body.requestFullscreen();
        this.components = {};
    }

    init(): void {
     
        this.addComponent('loading', new LoadingUi(this.wrapper, this));
        this.addComponent('main', new MainUI(this.wrapper, this));
        this.addComponent('hud', new HudUi(this.wrapper, this));

        this.bus.on("assetLoaded", (e) => {
            const customEvent = e ;
            if (customEvent.level === 0) {
                this.components.main.show();
            }
        });
    }

    addComponent(name: string, component: any): void {
        this.components[name] = component;
    }
}

export default UI;
