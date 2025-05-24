import type { World } from '@dimforge/rapier3d';


export type PhysicsEngine = {
    world: World;
    RAPIER: typeof import("@dimforge/rapier3d/exports");
    gravity: {
        x: number;
        y: number;
        z: number;
    };
}

export class Physics{
    static async init() {
        // Initialization logic for physics engine can go here
        const RAPIER = (await import('@dimforge/rapier3d')).default;
        // await RAPIER.init(); // Only needed if you're using the WASM backend manually
        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        const world = new RAPIER.World(gravity);
        // Optional: enable any additional features or settings for the physics world
        
        return {world,RAPIER,gravity};
    }
    static update(world: World, deltaTime: number) {
        // Update the physics world with the delta time
        //negetive deltatime can reverse time? answer is : not tested
        world.timestep = Math.min(deltaTime, 1 / 60);   // Cap the timestep to avoid large jumps
        world.step();
    }
}