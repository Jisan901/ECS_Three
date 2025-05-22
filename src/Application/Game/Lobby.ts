import * as THREE from "three/webgpu";
import { Component } from "../Component";
import type { WorldComponent } from "./WorldRenderer";



export default class Lobby extends Component implements WorldComponent {
    public scene: THREE.Scene;

    constructor(name: string) {
        super(name);
        this.scene = new THREE.Scene();
    }

    onLoad(): void {
        // Set up water, sky, sun, etc.
    }

    onExit(): void {
        // Cleanup logic
    }
}
