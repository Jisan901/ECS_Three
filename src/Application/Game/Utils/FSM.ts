import type { State } from "./CommonStates";

type ExtractStateName<T extends State> = T["name"];
type StateInstance = State & { name: string };

export class FiniteStateMachine<
  TProps,
  TStateMap extends Record<string, StateInstance>
> {
  public props: TProps;
  public previousState?: TStateMap[keyof TStateMap];
  public currentState?: TStateMap[keyof TStateMap];
  public States: TStateMap;

  constructor(props: TProps, states: TStateMap) {
    this.props = props;
    this.States = states;
  }

  protected onAction(newState: TStateMap[keyof TStateMap]): void {}

  dispatch<K extends keyof TStateMap>(name: K): void {
    const nextState = this.States[name];
    if (!nextState || this.currentState?.name === nextState.name) return;

    this.previousState = this.currentState;
    this.currentState = nextState;

    this.previousState?.exit?.();
    this.currentState.enter?.();

    this.onAction(this.currentState);
  }

  update(): void {
    this.currentState?.update?.();
  }

  getCurrentState(): TStateMap[keyof TStateMap] | undefined {
    return this.currentState;
  }

  getPreviousState(): TStateMap[keyof TStateMap] | undefined {
    return this.previousState;
  }
}
