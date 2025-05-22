import type { State } from "./CommonStates";


export class FiniteStateMachine<TProps> {
    private props: TProps;
    private previousState?: State;
    private currentState?: State;
    private States: Record<string, State> = {};

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
    protected onAction(newState: State): void {}

    dispatch(name: string): void {
        if (!this.States.hasOwnProperty(name)) return;

        const nextState = this.States[name];
        if (this.currentState?.name === name) return;

        this.previousState = this.currentState;
        this.currentState = nextState;

        this.previousState?.exit?.();
        this.currentState.enter?.(this.previousState);

        this.onAction(this.currentState);
    }

    update(prop?: any): void {
        this.currentState?.update?.(prop);
    }

    getCurrentState(): State | undefined {
        return this.currentState;
    }

    getPreviousState(): State | undefined {
        return this.previousState;
    }
}
