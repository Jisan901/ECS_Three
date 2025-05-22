import { Types, Velocity } from "./Utils/Types";
import { Position } from "./Utils/Types";
import { World } from "./Utils/World";

const world = new World();

const player = world.createEntity();

world.addComponent(player, { __type: Position._type, x: 100, y: 200 });
world.addComponent(player, { __type: Velocity._type, dx: 2, dy: -1 });

const pos = world.getComponent<Position>(player, Types.Position);
const vel = world.getComponent<Velocity>(player, Types.Position);

if (pos) console.table(pos);
if (vel) console.table(vel);



