import { FiniteStateMachine } from "../../../Application/Game/Utils/FSM";
import { State, type TransitionProps } from "../../../Application/Game/Utils/CommonStates";
import * as THREE from 'three/webgpu';
import { ECS } from "../../Utils/bootstrap";


type StateProps = {animations:Record<string,THREE.AnimationAction>, stateMachine:FiniteStateMachine<any>}


export class Idle extends State {
    public name = "idle";
    public action: THREE.AnimationAction;
    private props:StateProps;
    constructor(props: StateProps) {
        super()
        this.props = props;
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

    update(): void {
        const pad = ECS.instance.Input;

        if (!ECS.instance.Global.isGrounded) {
            this.props.stateMachine.dispatch('falling');
        } else if (pad.forward || pad.backward || pad.left || pad.right) {
            this.props.stateMachine.dispatch('walk');
        } else if (pad.buttons.actionPressed.pressed) {
            this.props.stateMachine.dispatch('attack');
        } else if (pad.buttons.spacePressed.pressed) {
            this.props.stateMachine.dispatch('jump');
        } else if (pad.buttons.autoSwitch.switch) {
            this.props.stateMachine.dispatch('run');
        }
    }
}


export class Fall extends State {
    public name = "falling";
    public action: THREE.AnimationAction;
    private props:StateProps;
    constructor(props: StateProps) {
        super()
        this.props = props
        this.action = this.props.animations[this.name];
    }

    enter(prev?: TransitionProps): void {
        if (!this.action) return;

        this.action.reset();
        if (prev?.action) {
            this.action.crossFadeFrom(prev.action, 0.5, true);
        }
        this.action.play();
    }

    update(): void {
        const pad = ECS.instance.Input;
        if (ECS.instance.Global.isGrounded) {
            if (pad.forward || pad.backward || pad.left || pad.right) {
                this.props.stateMachine.dispatch('walk');
            } else if (pad.buttons.actionPressed.pressed) {
                this.props.stateMachine.dispatch('attack');
            } else if (pad.buttons.autoSwitch.switch) {
                this.props.stateMachine.dispatch('run');
            } else {
                this.props.stateMachine.dispatch('idle');
            }
        }
    }
}


export class Walk extends State {
    public name = "walk";
    public action: THREE.AnimationAction;
    private props:StateProps;
    constructor(props: StateProps) {
        super();
        this.props = props
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

    update(): void {
        const pad = ECS.instance.Input;

        if (!ECS.instance.Global.isGrounded) {
            this.props.stateMachine.dispatch('falling');
            return;
        }

        if (pad.forward || pad.backward || pad.left || pad.right) {
            if (pad.buttons.autoSwitch.switch) {
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
    private props:StateProps;

    constructor(props: StateProps) {
        super();
        this.props = props;
        this.action = this.props.animations[this.name];
    }

    enter(prev?: TransitionProps): void {
        if (!this.action) return;

        this.action.reset();
        if (prev?.action) {
            this.action.crossFadeFrom(prev.action, 0.14, true);
        }
        this.action.play();
    }

    update(): void {
        const pad = ECS.instance.Input;

        if (!ECS.instance.Global.isGrounded) {
            this.props.stateMachine.dispatch('falling');
            return;
        }

        const moving = pad.forward || pad.backward || pad.left || pad.right;

        if (moving) {
            pad.buttons.autoSwitch.switch = false;
            this.props.stateMachine.dispatch('walk');
        } else if (!pad.buttons.autoSwitch.switch) {
            pad.buttons.autoSwitch.switch = false;
            this.props.stateMachine.dispatch('idle');
        }
    }
}


const playerFSM = new FiniteStateMachine({})


// playerFSM.onAction=(n)=>{
//     // This function can be used to handle actions when the state changes
//     // For example, you can log the current state or perform other actions
//     ECS.instance.dev.log(`State changed to: ${n.name}`);
// }
export const createPlayerAnimation = (animations: Record<string, THREE.AnimationAction>) => {
    playerFSM.addState(new Idle({ animations, stateMachine: playerFSM }));
    playerFSM.addState(new Fall({ animations, stateMachine: playerFSM }));
    playerFSM.addState(new Walk({ animations, stateMachine: playerFSM }));
    playerFSM.addState(new Run({ animations, stateMachine: playerFSM }));

    // Set initial state
    playerFSM.dispatch('idle');

    return playerFSM;
};