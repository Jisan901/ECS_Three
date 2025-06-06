import { debug } from '../../../Application/Parallelisms.ts';
debug(this)

class ThreadedChunkManager{
    readonly generationMatrix = [
            [ -50, -50 ], [ 50, -50 ],  [ 150, -50 ], [ 250, -50 ], [ 350, -50 ],[ 450, -50 ], [ 550, -50 ], [ 650, -50 ], [ 750, -50 ], [ 850, -50 ],
            [ -50, 50 ],  [ 50, 50 ],   [ 150, 50 ],  [ 250, 50 ],  [ 350, 50 ], [ 450, 50 ],  [ 550, 50 ],  [ 650, 50 ],  [ 750, 50 ],  [ 850, 50 ],
            [ -50, 150 ], [ 50, 150 ],  [ 150, 150 ], [ 250, 150 ], [ 350, 150 ],[ 450, 150 ], [ 550, 150 ], [ 650, 150 ], [ 750, 150 ], [ 850, 150 ],
            [ -50, 250 ], [ 50, 250 ],  [ 150, 250 ], [ 250, 250 ], [ 350, 250 ],[ 450, 250 ], [ 550, 250 ], [ 650, 250 ], [ 750, 250 ], [ 850, 250 ],
            [ -50, 350 ], [ 50, 350 ],  [ 150, 350 ], [ 250, 350 ], [ 350, 350 ],[ 450, 350 ], [ 550, 350 ], [ 650, 350 ], [ 750, 350 ], [ 850, 350 ],
            [ -50, 450 ], [ 50, 450 ],  [ 150, 450 ], [ 250, 450 ], [ 350, 450 ],[ 450, 450 ], [ 550, 450 ], [ 650, 450 ], [ 750, 450 ], [ 850, 450 ],
            [ -50, 550 ], [ 50, 550 ],  [ 150, 550 ], [ 250, 550 ], [ 350, 550 ],[ 450, 550 ], [ 550, 550 ], [ 650, 550 ], [ 750, 550 ], [ 850, 550 ],
            [ -50, 650 ], [ 50, 650 ],  [ 150, 650 ], [ 250, 650 ], [ 350, 650 ],[ 450, 650 ], [ 550, 650 ], [ 650, 650 ], [ 750, 650 ], [ 850, 650 ],
            [ -50, 750 ], [ 50, 750 ],  [ 150, 750 ], [ 250, 750 ], [ 350, 750 ],[ 450, 750 ], [ 550, 750 ], [ 650, 750 ], [ 750, 750 ], [ 850, 750 ],
            [ -50, 850 ], [ 50, 850 ],  [ 150, 850 ], [ 250, 850 ], [ 350, 850 ],[ 450, 850 ], [ 550, 850 ], [ 650, 850 ], [ 750, 850 ], [ 850, 850 ]
    ]
    public lodMatrix : number[] = [];


    public dataToSend? = {};

    public previousPos = {x:0,y:0}
    public chunkSize = 100;

    public lod1Dist = 200;
    public lod2Dist = 300;
    public lod3Dist = 400;

    constructor(){
        this.dataToSend;
        if (this.lodMatrix.length === 0) {
            this.lodMatrix = Array(this.generationMatrix.length).fill(-1);
        }
    }
    getLODLevel(dist: number): number {
        if (dist < this.lod1Dist) return 1;
        if (dist < this.lod2Dist) return 2;
        return 3;
    }
    roundWithMultiple(number:number, which:number):number {
        let dividend = number % which;
        if (which/2 < dividend) {
            return (number - dividend) + which;
        }
        else{
            return number - dividend;
        }
    }
    start({ data }: any) {
        let { playerPosition } = data;
        if (!playerPosition) playerPosition = {x:0,y:0}
        const updatedChunks: {
            index: number;
            lod: number;
            stitch: { posX: boolean; negX: boolean; posZ: boolean; negZ: boolean };
        }[] = [];

        const width = 10; // 10x10 grid
        const height = 10;

        if (this.lodMatrix.length === 0) {
            this.lodMatrix = Array(this.generationMatrix.length).fill(-1);
        }

        this.generationMatrix.forEach(([x, z], index) => {
            const dx = playerPosition.x - x;
            const dz = playerPosition.y - z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const newLod = this.getLODLevel(dist);
            const prevLod = this.lodMatrix[index];

            // Calculate grid position
            const gridX = index % width;
            const gridZ = Math.floor(index / width);

            // Neighbor LODs
            const getLodAt = (gx: number, gz: number): number | null => {
                if (gx < 0 || gx >= width || gz < 0 || gz >= height) return null;
                return this.lodMatrix[gz * width + gx];
            };

            const lodNegX = getLodAt(gridX - 1, gridZ);
            const lodPosX = getLodAt(gridX + 1, gridZ);
            const lodNegZ = getLodAt(gridX, gridZ - 1);
            const lodPosZ = getLodAt(gridX, gridZ + 1);

            const stitch = {
                negX: lodNegX !== null && lodNegX !== newLod,
                posX: lodPosX !== null && lodPosX !== newLod,
                negZ: lodNegZ !== null && lodNegZ !== newLod,
                posZ: lodPosZ !== null && lodPosZ !== newLod,
            };

            const stitchingRequired = Object.values(stitch).some(Boolean);

            if (newLod !== prevLod || stitchingRequired) {
                updatedChunks.push({ index, lod: newLod, stitch });
            }

            this.lodMatrix[index] = newLod;
        });

        if (updatedChunks.length > 0) {
            this.dataToSend = { type: 'create', updates: updatedChunks };
        }
    }


    
    update({ data }: any) {
        const { playerPosition } = data;

        // const distP = Math.hypot(
        //     this.roundWithMultiple(playerPosition.x, 100) - this.previousPos.x,
        //     this.roundWithMultiple(playerPosition.y, 100) - this.previousPos.y
        // );

        // this.previousPos.x = this.roundWithMultiple(playerPosition.x, 100);
        // this.previousPos.y = this.roundWithMultiple(playerPosition.y, 100);

        // if (distP < 50) {
        //     return;
        // }

        const updatedChunks: {
            index: number;
            lod: number;
            stitch: { posX: boolean; negX: boolean; posZ: boolean; negZ: boolean };
        }[] = [];

        const width = 10; // 10x10 grid
        const height = 10;

        if (this.lodMatrix.length === 0) {
            this.lodMatrix = Array(this.generationMatrix.length).fill(-1);
        }

        this.generationMatrix.forEach(([x, z], index) => {
            const dx = playerPosition.x - x;
            const dz = playerPosition.y - z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const newLod = this.getLODLevel(dist);
            const prevLod = this.lodMatrix[index];

            // Calculate grid position
            const gridX = index % width;
            const gridZ = Math.floor(index / width);

            // Neighbor LODs
            const getLodAt = (gx: number, gz: number): number | null => {
                if (gx < 0 || gx >= width || gz < 0 || gz >= height) return null;
                return this.lodMatrix[gz * width + gx];
            };

            const lodNegX = getLodAt(gridX - 1, gridZ);
            const lodPosX = getLodAt(gridX + 1, gridZ);
            const lodNegZ = getLodAt(gridX, gridZ - 1);
            const lodPosZ = getLodAt(gridX, gridZ + 1);

            const stitch = {
                negX: lodNegX !== null && lodNegX !== newLod,
                posX: lodPosX !== null && lodPosX !== newLod,
                negZ: lodNegZ !== null && lodNegZ !== newLod,
                posZ: lodPosZ !== null && lodPosZ !== newLod,
            };

            // const stitchingRequired = Object.values(stitch).some(Boolean);

            if (newLod !== prevLod) {
                updatedChunks.push({ index, lod: newLod, stitch });
            }

            this.lodMatrix[index] = newLod;
        });

        if (updatedChunks.length > 0) {
            this.dataToSend = { type: 'lodUpdates', updates: updatedChunks };
        }
    }

    toJSON(){
        return this.dataToSend;
    }
    query(){
        return this.toJSON();
    }
}


const threadedChunkManager = new ThreadedChunkManager();


function send(){
    if(threadedChunkManager.dataToSend) postMessage(threadedChunkManager.toJSON());
    threadedChunkManager.dataToSend = undefined;
}
onmessage = ({data})=>{
    if (data.type === "boot") {
        threadedChunkManager.start(data)
        send();
    }
    else if(data.type === "update"){
        threadedChunkManager.update(data)
        send();
    }
    else if(data.type === "query"){
        postMessage(threadedChunkManager.query())
    }
    else{}
}
