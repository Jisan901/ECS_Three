import { Component } from "../Component.ts";
import * as THREE from "three/webgpu";

import World from "./World.ts";


export interface WorldComponent extends Component {
    scene: THREE.Scene;
    onLoad(): void;
    onExit?(): void;
}

export default class WorldRenderer extends Component {
    public currentWorld?: WorldComponent;
    public defaultScene: THREE.Scene;
    public scene: THREE.Scene;


    constructor(name: string) {
        super(name);
		this.defaultScene = new THREE.Scene();
		this.scene = this.defaultScene
    }

    setup(): void {
        this.addComponent(new World('world'));
    }

    start(): void {
        this.setup();
        
    }

    setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    load(level: number): void {
        let world: WorldComponent | undefined;

        if (this.currentWorld && this.currentWorld.onExit) {
            this.currentWorld.onExit();
        }

        if (level === 1) {
            world = this.findComponentByName('world') as WorldComponent;
        }

        if (world) {
            world.onLoad();
            this.setScene(world.scene);
        } else {
            this.setScene(this.defaultScene);
        }

        this.currentWorld = world;
    }

   
}
