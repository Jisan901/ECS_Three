/*
ECS
v.0.0.2
*/


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Group } from 'three';
import type { Communicator } from '../ECS/Utils/Bus';
import type { Events } from '../ECS/Utils/Events';


// Define the structure of assets
type AssetStructure = string | AssetStructure[] | { [key: string]: AssetStructure };

interface AssetMap {
    [key: number]: AssetStructure;
}

const ASSETS: AssetMap = {
    1: {
        character: "/public/ybot/Y Bot.fbx",
        animations: {
            idle: "/public/ybot/Idle.fbx",
            walk: "/public/ybot/Walking.fbx",
            run: "/public/ybot/Running.fbx",
            falling: "/public/ybot/Falling Idle.fbx",
        },
    }
};

class AssetManager {
    private bus: Communicator<Events>;
    private assets: Record<number, any> = {};
    private totalFiles: number = 0;
    private loadedFiles: number = 0;

    private loaders = {
        gltf: new GLTFLoader(),
        fbx: new FBXLoader(),
        mtl: new MTLLoader(),
        obj: new OBJLoader(),
    };

    constructor(bus: Communicator<Events>) {
        this.bus = bus;
    }

    async loadLevel(which: number): Promise<void> {
        const assetData = ASSETS[which];
        if (!assetData) return;

        this.totalFiles = this.countFiles(assetData);
        this.loadedFiles = 0;

        this.bus.emit('progress', { progress: 0, show: true  }); ///bus v2
        await this.load(ASSETS, which, this.assets);

        const callback = () => {
            this.bus.emit('assetLoaded',  { level: which });
        };

        this.bus.emit('progress', { progress: 100, hide: true, callback } );
    }

    private countFiles(data: AssetStructure): number {
        let count = 0;

        const recursiveCount = (obj: AssetStructure) => {
            if (typeof obj === "string") {
                count++;
            } else if (Array.isArray(obj)) {
                obj.forEach(item => recursiveCount(item));
            } else if (typeof obj === "object") {
                for (const key in obj) {
                    recursiveCount(obj[key]);
                }
            }
        };

        recursiveCount(data);
        return count;
    }

    private async load(data: any, which: string | number, where: any): Promise<void> {
        if (typeof data[which] === "string") {
            await this.loadFile(data[which], where, which);
        } else if (Array.isArray(data[which])) {
            where[which] = [];
            for (let i = 0; i < data[which].length; i++) {
                await this.load(data[which], i, where[which]);
            }
        } else if (typeof data[which] === "object") {
            where[which] = {};
            for (const prop in data[which]) {
                await this.load(data[which], prop, where[which]);
            }
        }
    }

    private async loadFile(file: string, object: any, key: string | number): Promise<void> {
        const loader = this.getLoader(file);
    
        return new Promise<void>((resolve, reject) => {
            if (loader instanceof GLTFLoader) {
                loader.load(
                    file,
                    (gltf) => {
                        object[key] = gltf; // type: GLTF
                        this.onFileLoaded();
                        resolve();
                    },
                    undefined,
                    (err) => reject(err)
                );
            } else if (loader instanceof FBXLoader || loader instanceof OBJLoader) {
                loader.load(
                    file,
                    (group: Group) => {
                        object[key] = group;
                        this.onFileLoaded();
                        resolve();
                    },
                    undefined,
                    (err) => reject(err)
                );
            } else if (loader instanceof MTLLoader) {
                loader.load(
                    file,
                    (materialCreator) => {
                        object[key] = materialCreator;
                        this.onFileLoaded();
                        resolve();
                    },
                    undefined,
                    (err) => reject(err)
                );
            } else {
                console.warn(`Unknown loader for file: ${file}`);
                resolve();
            }
        });
    }
    
    private onFileLoaded(): void {
        
        this.loadedFiles++;
        const progress = (this.loadedFiles / this.totalFiles) * 100;
        this.bus.emit('progress', { progress: progress }); ///bus v2
    }
    

    getAssets<T>(level: number): T {
        return this.assets[level];
    }

    private getLoader(file: string): GLTFLoader | FBXLoader | MTLLoader | OBJLoader {
        if (file.endsWith('.fbx')) {
            return this.loaders.fbx;
        } else if (file.endsWith('.glb') || file.endsWith('.gltf')) {
            return this.loaders.gltf;
        } else if (file.endsWith('.mtl')) {
            return this.loaders.mtl;
        } else if (file.endsWith('.obj')) {
            return this.loaders.obj;
        } else {
            return this.loaders.fbx; // fallback
        }
    }
}

export default AssetManager;

// const b : AssetManager | undefined =  new AssetManager()
// const v=  b?.getAssets<Mesh>(1)
// v.character
// v.chara
