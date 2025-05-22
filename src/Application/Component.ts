import type { IInitials } from "./Game";

export class Component {
    public uuid: string;
    public name: string;
    public components: Component[] = [];
    public parent: Component | null = null;
    public props: Record<string, any> = {};
    public root: MainLoop | null = null;
    public updateNeeded: boolean = false;
    public isRoot: boolean = false;

    constructor(name?: string) {
        this.uuid = typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString();

        this.name = name ?? this.uuid;
    }

    /** User-defined start logic. */
    start(): void {}

    /**
     * User-defined repeat logic.
     * @param delta - Time delta for update.
     */
    repeat(delta: number): void {
        this.updateNeeded = false; // Reset update flag
    }

    /** Initialize the component and its children. */
    init(): void {
        this.start();
        this.components.forEach(component => component.init());
        this.updateNeeded = true;
    }

    /** User-defined stop logic. */
    onDiscard(): void {
        this.updateNeeded = false;
    }

    /**
     * Update the component and its children.
     * @param delta - Time delta for update.
     */
    update(delta: number): void {
        if (this.updateNeeded) {
            this.repeat(delta);
            this.components.forEach(component => component.update(delta));
        }
    }

    /** Discard the component and its children. */
    discard(): void {
        this.onDiscard();
        this.components.forEach(component => component.discard());
    }

    /**
     * Find a component by UUID.
     * @param uuid - The UUID of the component.
     * @returns The found component or undefined.
     */
    findComponent(uuid: string): Component | undefined {
        return this.components.find(e => e.uuid === uuid);
    }

    /**
     * Find a component by name.
     * @param name - The name of the component.
     * @returns The found component or undefined.
     */
    findComponentByName(name: string): Component | undefined {
        return this.components.find(e => e.name === name);
    }

    /**
     * Add a component as a child.
     * @param component - The component to add.
     */
    addComponent(component: Component): void {
        if (!this.components.includes(component)) {
            this.components.push(component);
            component.setParent(this);
        }
    }

    /**
     * Remove a component from the children.
     * @param component - The component to remove.
     */
    removeComponent(component: Component): void {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.parent = null;
            component.root = null;
        }
    }

    /**
     * Set the parent of the component.
     * @param parent - The parent component.
     */
    setParent(parent: Component | null): void {
        if (parent === this) return;

        if (this.parent) {
            this.parent.removeComponent(this);
        }

        this.parent = parent;

        if (parent) {
            if (!parent.components.includes(this)) {
                parent.components.push(this);
            }
            this.root = parent.isRoot ? parent as MainLoop : parent.root;
        } else {
            this.root = null;
        }
    }
}

export class MainLoop extends Component {
    public initials: IInitials;

    constructor(initials: IInitials) {
        super('MainLoop');
        this.initials = initials;
        this.isRoot = true;
        this.root = this;
    }

    /** Initialize the main loop and its children. */
    start(): void {
        this.components.forEach(component => component.init());
        this.updateNeeded = true;
    }

    /**
     * Update the main loop and its children.
     * @param delta - Time delta for update.
     */
    repeat(delta: number): void {
        if (this.updateNeeded) {
            this.components.forEach(component => component.update(delta));
        }
    }

    /** Override default `init` if needed */
    init(): void {
        // Custom main loop init logic
    }

    /** Override default `update` if needed */
    update(delta: number): void {
        // Custom main loop update logic
    }

    /** Stop the main loop. */
    stop(): void {
        this.updateNeeded = false;
    }
}
