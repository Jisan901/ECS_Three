import MainUI from './UI/main.ts';
import LoadingUi from "./UI/loading.ts";
import HudUi from "./UI/Hud.ts";
import type Application from './Application.ts';

type ComponentMap = Record<string, any>;

class UI {
    public global: EventTarget;
    public wrapper: HTMLElement;
    public components: ComponentMap;
    public application?: Application;

    constructor(global: EventTarget) {
        this.global = global;
        const wrapperEl = document.getElementById('wrapper');
        if (!wrapperEl) {
            throw new Error("Element with id 'wrapper' not found");
        }
        this.wrapper = wrapperEl;
        document.body.onclick = () => this.wrapper.requestFullscreen();
        this.components = {};
    }

    init(application: any): void {
        this.application = application;

        this.addComponent('loading', new LoadingUi(this.wrapper, this));
        this.addComponent('main', new MainUI(this.wrapper, this));
        this.addComponent('hud', new HudUi(this.wrapper, this));

        this.global.addEventListener("loaded", (e: Event) => {
            const customEvent = e as CustomEvent<{ level: number }>;
            if (customEvent.detail.level === 0) {
                this.components.main.show();
            }
        });
    }

    addComponent(name: string, component: any): void {
        this.components[name] = component;
    }
}

export default UI;
