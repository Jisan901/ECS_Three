import * as THREE from 'three/webgpu';
import { BufferGeometryUtils, OrbitControls } from 'three/examples/jsm/Addons.js';
import { attribute, float, floor, Fn, If, min, mix, mod, positionGeometry, positionLocal, pow, uniform, vec2, vec3, vec4, vertexIndex } from 'three/tsl';
import { cnoise } from './Application/Utils/cnoise';
import GUI from 'lil-gui';
/**
 * Returns the amount of bytes used by all attributes to represent the geometry.
 *
 * @param {BufferGeometry} geometry - The geometry.
 * @return {number} The estimate bytes used.
 */
function estimateBytesUsed( geometry: THREE.BufferGeometry ): number {

    // Return the estimated memory used by this geometry in bytes
    // Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
    // for InterleavedBufferAttributes.
    let mem = 0;
    for ( const name in geometry.attributes ) {

        const attr = geometry.getAttribute( name );
        mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

    }

    const indices = geometry.getIndex();
    mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
    return mem;

}
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGPURenderer;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 5, 10);

renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


scene.add(new THREE.GridHelper())
scene.add(new THREE.AxesHelper())

const terrain = {
    width: 1000, // 1km
    maxHeight: 100,
    lods: 5,
    chunkSize: 100,
}

const gui = new GUI()

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
        BufferGeometryUtils.toTrianglesDrawMode(geometry, THREE.TriangleStripDrawMode)
       
        geometry.computeBoundingBox()
        geometry.computeVertexNormals(); // Compute normals for lighting
       
        const material = new THREE.MeshStandardNodeMaterial({ color: 0x00ff00, side:THREE.DoubleSide, wireframe: true });


        const center = uniform(vec2(this.center.x, this.center.z))
        const chunkIndex = uniform(float(this.index))
        const lod = uniform(float(this.lod))
        const neibLods = uniform(vec4(2,2,2,2))//[+x,-x,+z,-z]
        const interpolationFactor = uniform(float(0.0))
        const segmentXy = pow(2, float(5).sub(lod)).add(1).toInt()

        // vertexIndex  = vertexIndex

        const row = floor(vertexIndex.toInt().div(segmentXy).toFloat()).toVar()
        const col = mod(vertexIndex.toInt(), segmentXy).toVar()
        

        const stitchingPosition = Fn( ( { position}:{ position:THREE.TSL.ShaderNodeObject<THREE.Node> } ) => {
            const result = position.toVec3().toVar();
            If(
            row.equal(segmentXy.sub(1)).and(neibLods.z.greaterThan(lod)),
                () => {
                    const neibLOD = neibLods.z;

                    const segmentNeighbor = pow(2.0, float(5).sub(neibLOD)).add(1.0);
                    const segmentCurrent = pow(2.0, float(5).sub(lod)).add(1.0);
                    const step = segmentCurrent.sub(1.0).div(segmentNeighbor.sub(1.0)).toVar();
                    const spacing = float(100.0).div(segmentCurrent.sub(1.0)).toVar(); // chunkSize = 100
                    const spacingNeighbor = float(100.0).div(segmentNeighbor.sub(1.0)).toVar(); // chunkSize = 100
                    const colF = col.toFloat();
                    const modedCol = mod(colF, step).toVar()
                    const isShared = modedCol.equal(0.0);

                    If(isShared.not(), () => {

                        const worldX = result.x.add(center.x);
                        const worldZ = result.z.add(center.y);

                        const cmX = modedCol.mul(spacing)
                        
                        const leftX = positionLocal.x.sub(cmX);
                        const rightX = positionLocal.x.add(spacingNeighbor.sub(cmX))


                        const z = center.y;

                        const stepSize = step.mul(spacing);
                        
                        
                        const t = (stepSize).div(spacingNeighbor);

                        const h1 = min(7,float(5).mul(cnoise({ P: vec2(center.x.add(leftX).mul(0.1), z.add(result.z).mul(0.1)) })));
                        const h2 = min(7,float(5).mul(cnoise({ P: vec2(center.x.add(rightX).mul(0.1), z.add(result.z).mul(0.1)) })));

                        result.y.assign(mix(h1, h2, interpolationFactor));
                        //result.y.assign(0)
                    });

                }
            );


            If(
                col.equal(0).and(neibLods.x.greaterThan(lod)),
                () => {
                    result.addAssign(vec3(0,0,0))
                }
            );

            If(
                row.equal(segmentXy.sub(1)).and(neibLods.w.greaterThan(lod)),
                () => {
                    result.addAssign(vec3(0,0,0))
                }
            );

            If(
                col.equal(segmentXy.sub(1)).and(neibLods.y.greaterThan(lod)),
                () => {
                    result.addAssign(vec3(0,0,0))
                }
            );


            return result
        } );

        // // Stitching logic for all 4 directions (+x, -x, +z, -z)
        // // +x direction: first col stitched if neighbor +x has higher lod
        // If(
        //    col.greaterThan(0),
        //     () => {
        //     }
        // );
        material.positionNode = stitchingPosition({position : positionLocal});
        material.colorNode = vec3(lod.div(5)).add(cnoise({P:vec2(positionLocal.xz.mul(0.1))}));

        // // -x direction: last col stitched if neighbor -x has higher lod
        // If(
        //     neibLods.y.greaterThan(lod).and(col.equal(segmentXy)),
        //     () => {
        //     material.positionNode = vec3(positionGeometry.xyz).add(vec3(0,5,0))
        //     }
        // );

        // // +z direction: first row stitched if neighbor +z has higher lod
        // If(
        //     neibLods.z.greaterThan(lod).and(row.equal(0)),
        //     () => {
        //     material.positionNode = vec3(positionGeometry.xyz).add(vec3(0,5,0))
        //     }
        // );

        // // -z direction: last row stitched if neighbor -z has higher lod
        // If(
        //     neibLods.w.greaterThan(lod).and(row.equal(segmentXy)),
        //     () => {
        //     material.positionNode = vec3(positionGeometry.xyz).add(vec3(0,5,0))
        //     }
        // );

        // material.positionNode = vec3(positionGeometry.xyz).add(vec3(0,5,0))
        
    //         If( conditional, function )
    // .ElseIf( conditional, function )
    // .Else( function )


        //let heightNode = attribute('height').toVar();
        // let positionNode = attribute('position').toVar();

        // //   let x = mod(vertexIndex, 32.0);
        // // let z = float(vertexIndex).div(32.0).floor();

        //  material.positionNode = positionNode
      
      

        gui.add(interpolationFactor,'value',0.1,1)
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(this.center.x, 0, this.center.z);
        // mesh.scale.set(this.step, 1, this.step); // Scale the mesh based on step size
        scene.add(mesh)
        return mesh;
    }
}



(new Chunk(1,{x:0,z:0})).load();
(new Chunk(2,{x:0,z:100})).load();






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