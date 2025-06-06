import { BatchedMesh, Group, MeshStandardMaterial } from "three/webgpu";
import { Thrade } from "../../../Application/Parallelisms";
import { ECS } from "../../Utils/bootstrap";
import { Chunk } from "./Chunk"
import * as THREE from 'three/webgpu'

export class Terrain{
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
    private chunks : Chunk[] = [];
    private thrade : Thrade;
    public indicesLoader = new LODIndicesLoader();
    public material = new THREE.MeshBasicMaterial({wireframe:true})
    public terrainMesh = new Group( );
    
    constructor(){
        this.thrade = new Thrade(1,import.meta.resolve('./TerrainWorker.ts'),ECS.instance.JobSystem);
        this.thrade.data = {}
        this.thrade.data.playerPosition = {x:ECS.instance.Global.playerPosition.x,y:ECS.instance.Global.playerPosition.z}
        this.thrade.start()
        // this.terrainMesh.frustumCulled = false
        // this.terrainMesh.perObjectFrustumCulled = true

        const texture = new THREE.TextureLoader().load('/prototype_512x512_blue3.png')
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat = new THREE.Vector2(20,20)
          this.material.map = texture
    }
    resolve(){
        while(this.thrade.updateQueue.length!=0){
            const currentUpdate = this.thrade.updateQueue.shift() as {type:string,updates:({
            index: number;
            lod: number;
            stitch: { posX: boolean; negX: boolean; posZ: boolean; negZ: boolean };
        })[]};
        console.log(currentUpdate);
        
            if (currentUpdate.type === 'create') {
                for (let key in currentUpdate.updates) {
                    this.chunks[currentUpdate.updates[key].index] = new Chunk(currentUpdate.updates[key].lod,this.indicesLoader,this.generationMatrix[currentUpdate.updates[key].index], this.terrainMesh,this.material)
                
                  }
            }
            if (currentUpdate.type === 'lodUpdates') {
                for (let key in currentUpdate.updates) {
                  console.log(currentUpdate);
                  
                    this.chunks[currentUpdate.updates[key].index]?.update(currentUpdate.updates[key].lod)
                }
            }
        }
    }
    update(){
        // console.log(this.thrade);
        
        this.thrade.data.playerPosition = {x:ECS.instance.Global.playerPosition.x,y:ECS.instance.Global.playerPosition.z}
        this.resolve()
    }
}



type IndexKey = number;

export class LODIndicesLoader {
  private indexCache = new Map<IndexKey, number[]>();
  private uvCache = new Map<IndexKey, number[]>();
  /**
   * Returns or generates indices for a given lod.
   * @param lod - lod number
   */
  getIndices(lod: number): number[] {
    const key: IndexKey = lod;

    if (this.indexCache.has(key)) {
      return this.indexCache.get(key)!;
    }
    const widthSegments = Math.pow(2, 5 - lod); // 5 is max
    const heightSegments = widthSegments;
    const indices = this.generateIndices(widthSegments, heightSegments);
    this.indexCache.set(key, indices);
    return indices;
  }
  /**
   * Returns or generates UVs for a given lod.
   * @param lod - lod number
   */
  getUv(lod: number): number[] {
    const key: IndexKey = lod;

    if (this.uvCache.has(key)) {
      return this.uvCache.get(key)!;
    }
    const widthSegments = Math.pow(2, 5 - lod); // 5 is max
    const heightSegments = widthSegments;
    const uvs = this.generateUVs(widthSegments, heightSegments);
    this.uvCache.set(key, uvs);
    return uvs;
  }
  /**
   * Generates UVs for a grid (similar to PlaneGeometry).
   */
  private generateUVs(widthSegments: number, heightSegments: number): Array<number> {
    const uvs: number[] = [];
    const width = 1 / widthSegments;
    const height = 1 / heightSegments;

    for (let y = 0; y <= heightSegments; y++) {
      for (let x = 0; x <= widthSegments; x++) {
        uvs.push(x * width, y * height);
      }
    }

    return uvs;
  }
  /**
   * Generates triangle indices for a grid (similar to PlaneGeometry).
   */
  private generateIndices(widthSegments: number, heightSegments: number): Array<number> {
    const indices: number[] = [];

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const a = x + (widthSegments + 1) * y;
        const b = x + (widthSegments + 1) * (y + 1);
        const c = (x + 1) + (widthSegments + 1) * (y + 1);
        const d = (x + 1) + (widthSegments + 1) * y;

        // Two triangles per quad
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    return indices;
  }
}
