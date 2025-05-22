
import * as FSM from './FSM.ts';
import * as THREE from 'three/webgpu';



export class Entity {
    public id: string;
    public initialProps: any;
    public currentProps: any;
    public mesh: THREE.Object3D;
    public animations: Record<string, THREE.AnimationClip> = {};
    public mixer?: THREE.AnimationMixer;
    public controller: BasicController;
    public stateMachine: FSM.FiniteStateMachine<typeof this>;
    public spawned = false;
    public active = false;

    constructor(props: any) {
        this.id = crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString();
        this.initialProps = props;
        this.currentProps = structuredClone(this.initialProps);
        this.mesh = new THREE.Object3D();
        this.controller = new BasicController(this);
        this.stateMachine = new FSM.FiniteStateMachine(this);
        this.load();
    }

    load(): void {
        // Override in subclasses
    }

    onLoadEnd(): void {
        // Override in subclasses
    }

    onDead(): void {
        // Override in subclasses
    }

    spawn(position: THREE.Vector3, scene: THREE.Scene): void {
        this.mesh.position.copy(position);
        scene.add(this.mesh);
        this.spawned = true;
        this.active = true;
    }

    reset(): void {
        this.stateMachine.dispatch('idle');
        this.mesh.removeFromParent();
        this.currentProps = structuredClone(this.initialProps);
        this.spawned = false;
        this.active = false;
    }

    update(time: number): void {
        if (!this.spawned) return;
        this.mixer?.update(time);
        this.stateMachine.update(time);
        if (!this.active) return;
        this.controller.update(time);
    }
}

export class BasicController {
    public entity: Entity;
    public inputSystem: InputSystem;

    constructor(entity: Entity) {
        this.entity = entity;
        this.inputSystem = new InputSystem(this);
    }

    updatePositionRotation(time: number): void {
        // To be implemented by subclass or user
    }

    update(time: number): void {
        this.inputSystem.update(time);
        this.updatePositionRotation(time);
    }
}

export interface InputKeys {
    backward: boolean;
    forward: boolean;
    keyDown: boolean;
    left: boolean;
    right: boolean;
    actionPressed: boolean;
    spacePressed: boolean;
    autoSwitch: boolean;
}

export class InputSystem {
    public controller: BasicController;
    public entity: Entity;
    public keys: InputKeys = {
        backward: false,
        forward: false,
        keyDown: false,
        left: false,
        right: false,
        actionPressed: false,
        spacePressed: false,
        autoSwitch: false,
    };

    constructor(controller: BasicController) {
        this.controller = controller;
        this.entity = controller.entity;
    }

    update(time: number): void {
        // To be implemented
    }
}
