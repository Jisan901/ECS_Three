import dom from './Hud.htui';
import UIComponent from '../Utils/UIComponent.ts';
import type UI from '../UserInterface.ts';

export default class HudUI extends UIComponent {
    root: UI;

    constructor(parent: HTMLElement, ui: UI) {
        super(dom, parent);
        this.root = ui;

        this.root.global.addEventListener("showHud", () => {
            this.show();
        });

        this.root.global.addEventListener("hideHud", () => {
            this.hide();
        });
    }

    show() {
        this.append();
    }

    hide() {
        this.remove();
    }
}
