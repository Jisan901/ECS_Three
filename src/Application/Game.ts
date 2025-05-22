import { MainLoop } from "./Component.ts";
import setUpBasics from "./Utils/setUpBasics.ts";
import * as Parallelism from "./Parallelisms.ts";
import { LightGamePad } from './Utils/GamePad.ts';

import WorldRenderer from "./Game/WorldRenderer.ts";
import { CONST } from "./Utils/Constant.ts";

import type Application from "./Application.ts";
import type { Clock, PerspectiveCamera, Scene, WebGPURenderer } from "three/webgpu";
import type { World } from "@dimforge/rapier3d";

export interface IInitials {
    global:EventTarget,
    game:Game,
    application:Application,
    thradePool:Parallelism.ThradePool,
    renderer: WebGPURenderer,
    camera: PerspectiveCamera,
    world: World,
    RAPIER: typeof import("/home/isan/Code/Three-G/node_modules/@dimforge/rapier3d/exports"),
    render: (scene: Scene) => void,
    clock: Clock
}

export default class Game {
    public global: EventTarget;
    public SYSTEM!: MainLoop;
    public constants = CONST;
    public application!: Application;
    public thradePool: InstanceType<typeof Parallelism.ThradePool>;
    public started: boolean = false;
    public gamePad!: LightGamePad;
    public worldRenderer!: WorldRenderer;
    private RAF?: number;
    readonly debug: boolean;

    constructor(global: EventTarget) {
        this.debug = true;
        this.global = global;
        this.thradePool = new Parallelism.ThradePool(4);

    }

    async init(application: Application): Promise<void> {
        const initials:IInitials = {...await setUpBasics(),global:this.global,game:this,application,thradePool:this.thradePool};
        const hud = application.ui.components['hud'];
        this.gamePad = new LightGamePad(hud.dom);

        initials.global = this.global;
        initials.game = this;
        initials.application = application;
        initials.thradePool = this.thradePool;

        this.SYSTEM = new MainLoop(initials);
        this.application = application;
        this.addWorld();
        this.initListeners();
    }

    private addWorld(): void {
        this.worldRenderer = new WorldRenderer('worldrenderer');
        this.SYSTEM.addComponent(this.worldRenderer);
    }

    private initListeners(): void {
        this.global.addEventListener("startController", () => {
            this.start();
        });

        this.global.addEventListener("stopController", () => {
            this.stop();
        });

        this.global.addEventListener("saveController", () => {
            this.save();
        });

        this.global.addEventListener("loaded", (e: Event) => {   
            const event = e as CustomEvent<{ level: number }>;
            this.worldRenderer.load(event.detail.level);
        });
    }

    private start(): void {
        if (!this.started) {
            this.SYSTEM.start();
            this.started = true;
            this.application.ui.wrapper.appendChild(this.SYSTEM.initials.renderer.domElement);
        }

        const animate = (t: number) => {
            this.RAF = requestAnimationFrame(animate);
            this.update(t);
        };

        this.RAF = requestAnimationFrame(animate);
    }

    private update(t: number): void {
        if (this.worldRenderer) {
            this.SYSTEM.initials.render?.(this.worldRenderer.scene);
        }
        const deltaTime = this.SYSTEM.initials.clock?.getDelta();
        this.SYSTEM.repeat(deltaTime??t);
        this.thradePool.update(deltaTime??t);
    }

    private stop(): void {
        this.SYSTEM.stop();
        if (this.RAF !== undefined) {
            cancelAnimationFrame(this.RAF);
        }
    }

    private save(): void {
        // Implement save logic here
    }
}
