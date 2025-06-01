import dom from './Hud.htui';
import UIComponent from '../Utils/UIComponent.ts';
import type UI from '../UserInterface.ts';

export default class HudUI extends UIComponent {
    root: UI;

    constructor(parent: HTMLElement, ui: UI) {
        super(dom, parent);
        this.root = ui;

        this.root.bus.on("setGamePadVisibility", (e) => {
            console.log(e);
            
            if (e.visible) {
                this.show();
            }
            else this.hide();
        });
    }

    show() {
        this.append();
    }

    hide() {
        this.remove();
    }
}
