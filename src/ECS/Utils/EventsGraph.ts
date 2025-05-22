export type Events = {
    playSound: (payload: { name: string }) => void;
    spawnEntity: (payload: { type: string; position: { x: number; y: number } }) => void;
  };
  