import loadingDom from './loading.htui';
import UIComponent from '../Utils/UIComponent.ts';
import type UI from '../UserInterface.ts';

interface ProgressEventDetail {
    progress: number;
    show?: boolean;
    hide?: boolean;
    callback?: () => void;
}

export default class LoadingUI extends UIComponent {
    root: UI;
    bindedHandler: (e: CustomEvent<ProgressEventDetail>) => void;
    loadDom: HTMLElement | null;
    loadDombar: HTMLElement | null;
    showed: boolean;

    constructor(parent: HTMLElement, ui: UI) {
        super(loadingDom, parent);
        this.root = ui;

        this.bindedHandler = this.handleProgress.bind(this);
        this.root.global.addEventListener("progress", this.bindedHandler as EventListener);

        this.loadDom = this.dom.querySelector<HTMLElement>("#loading_percentage");
        this.loadDombar = this.dom.querySelector<HTMLElement>("#loading_percentagebar");

        this.showed = false;
    }

    show() {
        if (this.showed) return;
        this.append();
        this.showed = true;
    }

    handleProgress(e: CustomEvent<ProgressEventDetail>) {
        const { progress, show, hide, callback } = e.detail;

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
