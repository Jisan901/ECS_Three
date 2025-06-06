import { Vector3 } from "three/webgpu";
import * as THREE from 'three/webgpu';
import type { LODIndicesLoader } from "./Terrain";


export class Chunk{
    private position : Vector3;
    private geometry?: THREE.BufferGeometry;
    private transform?: THREE.Matrix4
    private geoId? : number;
    private instanceId ?: number;
    private mesh?: THREE.Mesh;

    constructor(private lod:number, private indicesLoader: LODIndicesLoader, private center:number[], private terrain:THREE.Group, private terrainMat?: THREE.Material){
        this.position = new Vector3(center[0],0,center[1])
        this.build()
    }
    async build(){
        const response = await fetch((`/public/Terrain-node/Data/heightData${this.lod}-${this.center[0]+50}x${this.center[1]+50}.json`));
        const parsedData = await response.json();
        const geometry = new THREE.BufferGeometry();

        geometry.setIndex(this.indicesLoader.getIndices(this.lod))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.indicesLoader.getUv(this.lod), 2))
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(parsedData.vertices,3))
        geometry.computeVertexNormals()
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()

        this.geometry = geometry;
        this.transform = new THREE.Matrix4()
        this.transform.setPosition(this.position)
        let mes = new THREE.Mesh(geometry,this.terrainMat)
        mes.position.copy(this.position)
        this.mesh = mes
        this.terrain.add(mes)
        // if(!this.terrainMesh) return
        // this.geoId = this.terrainMesh.addGeometry(geometry);
        // this.instanceId = this.terrainMesh.addInstance(this.geoId)

        // this.terrainMesh.setMatrixAt(this.instanceId, this.transform)
    }
    async update(lod:number){
        const response = await fetch(`/Terrain-node/Data/heightData${lod}-${this.center[0]+50}x${this.center[1]+50}.json`);
        const parsedData = await response.json();
        
        if (this.geometry&&this.mesh){
            this.geometry.dispose()
            this.geometry = new THREE.BufferGeometry()
            
        this.geometry.setIndex(this.indicesLoader.getIndices(lod))
        this.geometry.setAttribute('position',new THREE.Float32BufferAttribute(parsedData.vertices,3))
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.indicesLoader.getUv(lod), 2))
        this.geometry.computeVertexNormals()
       this.mesh.geometry = this.geometry
        }

        this.lod = lod
    }
}