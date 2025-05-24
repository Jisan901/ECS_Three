export type Events = {
    playSound: (payload: { name: string }) => void;
    spawnEntity: (payload: { type: string; position: { x: number; y: number } }) => void;
    setGamePadVisibility: (payload: { visible: boolean }) => void;
    progress:(payload: { progress: number, show?: boolean, hide?: boolean, callback?:()=>void }) => void
    assetLoaded:(payload:{ level: number }) => void
  };
  