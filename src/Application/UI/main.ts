import mainDom from './main.htui';
import UIComponent from '../Utils/UIComponent.ts';
import type UI from '../UserInterface.ts';

export default class MainUI extends UIComponent {
    root: UI;
    startButton: HTMLElement | null;

    constructor(parent: HTMLElement, ui: UI) {
        super(mainDom, parent);
        this.root = ui;

        this.startButton = this.dom.querySelector<HTMLElement>("#start_button");

        if (this.startButton) {
            this.startButton.addEventListener("click", () => {
                this.root.application?.assetManager.loadLevel(1);
                this.hide();
            });
        }
    }

    show() {
        this.append();
    }

    hide() {
        this.remove();
    }
}
