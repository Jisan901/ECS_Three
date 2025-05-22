export default class UIComponent {
    dom: HTMLElement;
    parent: HTMLElement;

    constructor(dom: HTMLElement, parent: HTMLElement) {
        this.dom = dom;
        this.parent = parent;
    }

    append(): void {
        this.parent.appendChild(this.dom);
    }

    setChild(): void {
        this.parent.firstChild
            ? this.parent.replaceChild(this.dom, this.parent.firstChild)
            : this.parent.appendChild(this.dom);
    }

    remove(): void {
        this.parent.removeChild(this.dom);
    }
}
