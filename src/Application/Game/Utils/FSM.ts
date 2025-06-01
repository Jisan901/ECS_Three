import type { State } from "./CommonStates";


export class FiniteStateMachine<TProps> {
    public props: TProps;
    public previousState?: State;
    public currentState?: State;
    public States: Record<string, State> = {};

    constructor(props: TProps) {
        this.props = props;
    }

    addState(state: State): void {
        if (this.States.hasOwnProperty(state.name)) return;
        this.States[state.name] = state;
    }

    /**
     * Called when the state changes. Override in subclasses if needed.
     */
    onAction(newState: State): void {}

    dispatch(name: string): void {
        if (!this.States.hasOwnProperty(name)) return;
        if (this.currentState?.name === name) return;

        const nextState = this.States[name];

        this.previousState = this.currentState;
        this.currentState = nextState;

        this.previousState?.exit?.();
        this.currentState.enter?.(this.previousState);

        this.onAction(this.currentState);
    }

    update(): void {
        this.currentState?.update?.();
    }

    getCurrentState(): State | undefined {
        return this.currentState;
    }

    getPreviousState(): State | undefined {
        return this.previousState;
    }
}