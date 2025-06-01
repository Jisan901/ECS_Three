import * as THREE from 'three/webgpu';
import type { PlayerEntity } from '../Player/PlayerEntity';
import type { FiniteStateMachine } from './FSM';

// Define shared props for all states

// Optional transition info passed to enter()
export type TransitionProps  = State

export interface InputKeys {
    backward: boolean;
    forward: boolean;
    keyDown: boolean;
    left: boolean;
    right: boolean;
    actionPressed: { pressed: boolean };
    spacePressed: { pressed: boolean };
    autoSwitch: { switch: boolean };
}

export class State {
    public name: string;
    public action?:THREE.AnimationAction
    constructor() {
        this.name = "nostate"
    }

    enter(_props?: TransitionProps): void {}
    transition(_props?: TransitionProps): void {}
    exit(_props?: TransitionProps): void {}
    update(): void {}
}



// export class Idle extends State {
//     public name = "idle";
//     public action: THREE.AnimationAction;

//     constructor(props: StateProps) {
//         super(props);
//         this.action = this.props.animations[this.name];
//     }

//     enter(prev?: TransitionProps): void {
//         if (!this.action) return;

//         this.action.reset();
//         if (prev?.action) {
//             this.action.crossFadeFrom(prev.action, 0.3, true);
//         }
//         this.action.play();
//     }

//     update(delta: number): void {
//         const pad = this.props.controller.inputSystem.keys;

//         if (!this.props.controller.component.physics.isGrounded) {
//             this.props.stateMachine.dispatch('falling');
//         } else if (pad.forward || pad.backward || pad.left || pad.right) {
//             this.props.stateMachine.dispatch('walk');
//         } else if (pad.actionPressed.pressed) {
//             this.props.stateMachine.dispatch('attack');
//         } else if (pad.spacePressed.pressed) {
//             this.props.stateMachine.dispatch('jump');
//         } else if (pad.autoSwitch.switch) {
//             this.props.stateMachine.dispatch('run');
//         }
//     }
// }

// export class Fall extends State {
//     public name = "falling";
//     public action: THREE.AnimationAction;

//     constructor(props: StateProps) {
//         super(props);
//         this.action = this.props.animations[this.name];
//     }

//     enter(prev?: TransitionProps): void {
//         if (!this.action) return;

//         this.action.reset();
//         if (prev?.action) {
//             this.action.crossFadeFrom(prev.action, 0.5, true);
//         }
//         this.action.play();
//     }

//     update(delta: number): void {
//         const pad = this.props.controller.inputSystem.keys;
//         if (this.props.controller.component.physics.isGrounded) {
//             if (pad.forward || pad.backward || pad.left || pad.right) {
//                 this.props.stateMachine.dispatch('walk');
//             } else if (pad.actionPressed.pressed) {
//                 this.props.stateMachine.dispatch('attack');
//             } else if (pad.autoSwitch.switch) {
//                 this.props.stateMachine.dispatch('run');
//             } else {
//                 this.props.stateMachine.dispatch('idle');
//             }
//         }
//     }
// }

export class Walk extends State {
    public name = "walk";
    public action: THREE.AnimationAction;

    constructor(props: StateProps) {
        super(props);
        this.action = this.props.animations[this.name];
    }

    enter(prev?: TransitionProps): void {
        if (!this.action) return;

        this.action.reset();
        if (prev?.action) {
            this.action.crossFadeFrom(prev.action, 0.3, true);
        }
        this.action.play();
    }

    update(delta: number): void {
        const pad = this.props.controller.inputSystem.keys;

        if (!this.props.controller.component.physics.isGrounded) {
            this.props.stateMachine.dispatch('falling');
            return;
        }

        if (pad.forward || pad.backward || pad.left || pad.right) {
            if (pad.autoSwitch.switch) {
                this.props.stateMachine.dispatch('run');
            }
            return;
        }

        this.props.stateMachine.dispatch('idle');
    }
}

export class Run extends State {
    public name = "run";
    public action: THREE.AnimationAction;

    constructor(props: StateProps) {
        super(props);
        this.action = this.props.animations[this.name];
    }

    enter(prev?: TransitionProps): void {
        if (!this.action) return;

        this.action.reset();
        if (prev?.action) {
            this.action.crossFadeFrom(prev.action, 0.3, true);
        }
        this.action.play();
    }

    update(delta: number): void {
        const pad = this.props.controller.inputSystem.keys;

        if (!this.props.controller.component.physics.isGrounded) {
            this.props.stateMachine.dispatch('falling');
            return;
        }

        const moving = pad.forward || pad.backward || pad.left || pad.right;

        if (moving) {
            pad.autoSwitch.switch = false;
            this.props.stateMachine.dispatch('walk');
        } else if (!pad.autoSwitch.switch) {
            pad.autoSwitch.switch = false;
            this.props.stateMachine.dispatch('idle');
        }
    }
}


// export class FPSWalk extends State{
//     constructor(props){
//         super(props);
//         this.name = "fpswalk";
//         this.action = null
//     }
//     enter(props){
        
//     }
//     update(props){
//         const padState = this.props.controller.inputSystem.keys;
//         if (padState.forward || padState.backward || padState.left || padState.right) {
//             if (padState.autoSwitch.switch) {
//                 this.props.stateMachine.dispatch('run');
//             }
//         return;
//         }
  
//         this.props.stateMachine.dispatch('fpsidle');
//     }
// }

// export class Jump extends State{
//     constructor(props){
//         super(props);
//         this.name = "jump";
//         this.action = this.props.animations[this.name];
//         this.finishedCallback = ()=>{
//             this.finished()
//         }
//     }
//     enter(props){
//         if (!this.action) return;
//         this.props.mixer.addEventListener('finished', this.finishedCallback);
//         if (props) {
//             this.action.reset()
//             this.action.setLoop(THREE.LoopOnce, 1);
//             this.action.clampWhenFinished = true;
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     finished(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//         this.props.stateMachine.dispatch('idle');
//     }
//     exit(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//     }
//     update(props){
        
//     }
// }
// export class Attack extends State{
//     constructor(props){
//         super(props);
//         this.name = "attack";
//         this.action = this.props.animations[this.name];
//         this.finishedCallback = ()=>{
//             this.finished()
//         }
//     }
//     enter(props){
//         if (!this.action) return;
//         this.props.mixer.addEventListener('finished', this.finishedCallback);
//         if (props) {
//             this.action.reset()
//             this.action.setLoop(THREE.LoopOnce, 1);
//             this.action.clampWhenFinished = true;
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     finished(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//         this.props.stateMachine.dispatch('idle');
//     }
//     exit(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//     }
//     update(props){
        
//     }
// }
// export class Death extends State{
//     constructor(props){
//         super(props);
//         this.name = "death";
//         this.action = this.props.animations[this.name];
//     }
//     enter(props){
//         if (!this.action) return;
//         if (props) {
//             this.action.reset()
//             this.action.setLoop(THREE.LoopOnce, 1);
//             this.action.clampWhenFinished = true;
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     update(props){
        
//     }
// }

// export class FPSIdle extends State{
//     constructor(props){
//         super(props);
//         this.name = "fpsidle";
//     }
//     enter(props){
        
//     }
//     update(props){
//         const padState = this.props.controller.inputSystem.keys;
//         if (padState.forward || padState.backward || padState.left || padState.right) {
//             this.props.stateMachine.dispatch('fpswalk');
//         } else if (padState.actionPressed.pressed) {
//             this.props.stateMachine.dispatch('fpsitact');
//         } else if (padState.spacePressed.pressed) {
//             this.props.stateMachine.dispatch('jump');
//         }else if (padState.autoSwitch.switch) {
//             this.props.stateMachine.dispatch('run');
//         }
//     }
// }
// export class FPSInteraction extends State{
//     constructor(props){
//         super(props);
//         this.name = "fpsitact";
//     }
//     enter(props){
        
//     }
//     update(props){
//         const padState = this.props.controller.inputSystem.keys;
//         if (padState.forward || padState.backward || padState.left || padState.right) {
//             this.props.stateMachine.dispatch('fpswalk');
//         } else if (padState.actionPressed.pressed) {
//             this.props.stateMachine.dispatch('attack');
//         } else if (padState.spacePressed.pressed) {
//             this.props.stateMachine.dispatch('jump');
//         }else if (padState.autoSwitch.switch) {
//             this.props.stateMachine.dispatch('run');
//         }else{
//             this.props.stateMachine.dispatch('fpsidle');
//         }
//     }
// }

// export class Crouch extends State{
//     constructor(props){
//         super(props);
//         this.name = "crouch";
//         this.action = this.props.animations[this.name];
//         this.finishedCallback = ()=>{
//             this.finished()
//         }
//     }
//     enter(props){
//         if (!this.action) return;
//         this.props.mixer.addEventListener('finished', this.finishedCallback);
//         if (props) {
//             this.action.reset()
//             this.action.setLoop(THREE.LoopOnce, 1);
//             this.action.clampWhenFinished = true;
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     finished(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//         this.props.stateMachine.dispatch('cidle');
//     }
//     exit(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//     }
//     update(props){
        
//     }
// }
// export class CrouchWalk extends State{
//     constructor(props){
//         super(props);
//         this.name = "cwalk";
//         this.action = this.props.animations[this.name];
//     }
//     enter(props){
//         if (!this.action) return;
//         if (props) {
//             this.action.reset()
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     update(props){
//         const padState = this.props.controller.inputSystem.keys;
//         if (padState.forward || padState.backward || padState.left || padState.right) {
//             if (padState.autoSwitch.switch) {
//                 //this.props.stateMachine.dispatch('cwalk');
//             }
//         return;
//         }
  
//         this.props.stateMachine.dispatch('cidle');
//     }
// }
// export class CrouchIdle extends State{
//     constructor(props){
//         super(props);
//         this.name = "cidle";
//         this.action = this.props.animations[this.name];
//     }
//     enter(props){
//         if (!this.action) return;
//         if (props) {
//             this.action.reset()
//             this.action.crossFadeFrom(props.action,0.3, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     update(props){
//         const padState = this.props.controller.inputSystem.keys;
//         if (padState.forward || padState.backward || padState.left || padState.right) {
//             this.props.stateMachine.dispatch('cwalk');
//         } else if (!padState.spacePressed.switch) {
//             this.props.stateMachine.dispatch('ctonormal');
//         }
//     }
// }
// export class CrouchNormal extends State{
//     constructor(props){
//         super(props);
//         this.name = "ctonormal";
//         this.action = this.props.animations[this.name];
//         this.finishedCallback = ()=>{
//             this.finished()
//         }
//     }
//     enter(props){
//         if (!this.action) return;
//         this.props.mixer.addEventListener('finished', this.finishedCallback);
//         if (props) {
//             this.action.reset()
//             this.action.setLoop(THREE.LoopOnce, 1);
//             this.action.clampWhenFinished = true;
//             this.action.crossFadeFrom(props.action,0.1, true);
//             this.action.play();
//         }
//         else {
//             this.action.reset()
//             this.action.play()
//         }
//     }
//     finished(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//         this.props.stateMachine.dispatch('idle');
//     }
//     exit(){
//         this.props.mixer.removeEventListener('finished',this.finishedCallback)
//     }
//     update(props){
        
//     }
// }