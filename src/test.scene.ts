import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { attribute, float, floor, If, mod, pow, uniform, vec2, vec3, vec4, vertexIndex } from 'three/tsl';

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGPURenderer;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 5, 10);

renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


scene.add(new THREE.GridHelper())

const terrain = {
    width: 1000, // 1km
    maxHeight: 100,
    lods: 5,
    chunkSize: 100,
}


export class Chunk{
    private lod: number; // Level of Detail
    private center: { x: number, z: number }; // Center coordinates of the chunk
    private heightData: Float32Array | null; // Height data for the chunk
    private positionData: Float32Array | null; // Position data for the chunk
    private indices : number[] | null;
    private index?: number; // Step size based on LOD
   // private mat: THREE.MeshStandardNodeMaterial

    constructor(lod: number, center: { x: number, z: number }) {
        this.lod = lod; // Level of Detail
        this.center = center; // Center coordinates of the chunk
        this.heightData = null; // Height data for the chunk
        this.positionData = null; // Position data for the chunk
        this.indices = null
        this.index; // Step size based on LOD
       // this.mat = new THREE.MeshStandardNodeMaterial({ color: 0x00ff00, side:THREE.DoubleSide, wireframe: false });
        // this.mat.uniforms.chunkInfo = { value: new THREE.Vector4(this.center.x, this.center.z, this.lod, this.index ?? 0) };
        
    }
    async load() {
        // Load the chunk data from the file
        const response = await fetch(`/src/Terrain-node/Data/heightData${this.lod}-${this.center.x}x${this.center.z}.json`);
        const parsedData = await response.json();
        this.heightData =null// new Float32Array(parsedData.heightData);
        this.positionData = new Float32Array(parsedData.vertices);
        this.indices = (parsedData.indices);
        this.center = parsedData.center;
        this.lod = parsedData.lod;
        this.index = parsedData.index;
        this.buildMesh()
    }
    buildMesh() {
        // Build a mesh from the height and position data
        const geometry = new THREE.BufferGeometry();
        if ( !this.positionData) {
            throw new Error('Height and position data must be loaded before building the mesh.');
        }
        geometry.setIndex(this.indices)
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positionData, 3));
       
        geometry.computeBoundingBox()
        geometry.computeVertexNormals(); // Compute normals for lighting
        console.log(geometry);
        
        const material = new THREE.MeshStandardNodeMaterial({ color: 0x00ff00, side:THREE.DoubleSide, wireframe: false });


        const center = uniform(vec2(this.center.x, this.center.z))
        const cunkindex = uniform(float(this.index))
        const lod = uniform(float(this.lod))
        const neibLods = uniform(vec4(0,0,2,0))//[+x,-x,+z,-z]

        const segmentXy = pow(2, float(5).sub(lod)).toInt()

        // vertexIndex  = vertexIndex

        const row = floor(vertexIndex.div(segmentXy))
        const col = mod(vertexIndex, segmentXy)
        
        If(neibLods.x.greaterThan(lod).and(row.equal(1)),()=>{

        })
        

        
    //         If( conditional, function )
    // .ElseIf( conditional, function )
    // .Else( function )


        //let heightNode = attribute('height').toVar();
        // let positionNode = attribute('position').toVar();

        // //   let x = mod(vertexIndex, 32.0);
        // // let z = float(vertexIndex).div(32.0).floor();

        //  material.positionNode = positionNode
      
      


        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(this.center.x, 0, this.center.z);
        // mesh.scale.set(this.step, 1, this.step); // Scale the mesh based on step size
        scene.add(mesh)
        return mesh;
    }
}



(new Chunk(1,{x:100,z:0})).load();
(new Chunk(2,{x:100,z:100})).load();
(new Chunk(3,{x:100,z:200})).load();





const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light, new THREE.AmbientLight(0x404040));


const controls = new OrbitControls(camera, document.body);
controls.update();

function animate(){
    controls.update()
    renderer.renderAsync(scene,camera)
    requestAnimationFrame(animate)
}
animate()




// export class Chunk{
//     constructor(lod, center){
//         this.lod = lod; // Level of Detail
//         this.center = center; // Center coordinates of the chunk
//         this.heightData = null; // Height data for the chunk
//         this.positionData = null; // Position data for the chunk
//         this.step = terrain.chunkSize / Math.pow(2, terrain.lods - (lod - 1)); // Step size based on LOD
//     }
//     load() {
//         // Load the chunk data from the file
//         const data = fs.readFileSync(`Data/heightData${this.lod}-${this.center.x}x${this.center.z}.json`, 'utf8');
//         const parsedData = JSON.parse(data);
//         this.heightData = new Float32Array(parsedData.heightData);
//         this.positionData = new Float32Array(parsedData.positionData);
//         this.center = parsedData.center;
//         this.lod = parsedData.lod;
//         this.step = parsedData.step;
//     }
//     buildMesh() {
//         // Build a mesh from the height and position data
//         const geometry = new THREE.BufferGeometry();
//         if (!this.heightData || !this.positionData) {
//             throw new Error('Height and position data must be loaded before building the mesh.');
//         }
//         geometry.setAttribute('position', new THREE.BufferAttribute(this.positionData, 3));
//         geometry.setAttribute('height', new THREE.BufferAttribute(this.heightData, 1));
//         geometry.computeVertexNormals(); // Compute normals for lighting

//         const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
//         const mesh = new THREE.Mesh(geometry, material);
        
//         mesh.position.set(this.center.x, 0, this.center.z);
//         mesh.scale.set(this.step, 1, this.step); // Scale the mesh based on step size
        
//         return mesh;
//     }
// }