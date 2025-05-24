import loadingDom from './loading.htui';
import UIComponent from '../Utils/UIComponent.ts';
import type UI from '../UserInterface.ts';


export default class LoadingUI extends UIComponent {
    root: UI;
    bindedHandler: (e: { progress: number; show?: boolean | undefined; hide?: boolean | undefined; callback?: (() => void) | undefined; }) => void;
    loadDom: HTMLElement | null;
    loadDombar: HTMLElement | null;
    showed: boolean;

    constructor(parent: HTMLElement, ui: UI) {
        super(loadingDom, parent);
        this.root = ui;

        this.bindedHandler = this.handleProgress.bind(this);
        this.root.bus.on("progress", this.bindedHandler);

        this.loadDom = this.dom.querySelector<HTMLElement>("#loading_percentage");
        this.loadDombar = this.dom.querySelector<HTMLElement>("#loading_percentagebar");

        this.showed = false;
    }

    show() {
        if (this.showed) return;
        this.append();
        this.showed = true;
    }

    handleProgress(e:{ progress: number; show?: boolean | undefined; hide?: boolean | undefined; callback?: (() => void) | undefined; }) {
        const { progress, show, hide, callback } = e;

        if (show) {
            this.show();
            setTimeout(() => {
                callback?.();
            }, 2000);
        }

        if (this.loadDombar) this.loadDombar.style.width = `${progress}%`;
        if (this.loadDom) this.loadDom.innerText = `${progress}%`;

        if (hide && progress > 90) {
            setTimeout(() => {
                this.hide();
                callback?.();
            }, 2000);
        }
    }

    hide() {
        if (!this.showed) return;
        this.remove();
        this.showed = false;
    }
}
