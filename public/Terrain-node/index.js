// 1. create and store heigt data in float32[] using perlin noise for multiple lod.


import fs from 'fs';
import { cnoise } from './noise.js';
import {Noise} from "./perlin.js"

const terrain = {
    width: 1000, // 1km
    maxHeight: 100,
    lods: 5,
    chunkSize: 100,
}





import('three').then(THREE => {
    // genForLOD1();
  
    genTerrainMat().forEach((center,i)=>{
        console.log(center);
        genChunkForLOD({x: center[0], z: center[1]}, 1,i);
        genChunkForLOD({x: center[0], z: center[1]}, 2,i);
        genChunkForLOD({x: center[0], z: center[1]}, 3,i);
    })
   
})






function genTerrainMat(){
    // Generate a terrain matrix based on the terrain configuration . containing the center of each chunk.
    const terrainMatrix = new Array(terrain.width/terrain.chunkSize * terrain.width/terrain.chunkSize);
    const { width, chunkSize } = terrain;
    const step = chunkSize; // Step size for terrain matrix

    for (let x = 0; x < width; x += step) {
        for (let z = 0; z < width; z += step) {
            const index = Math.floor(x / step) + Math.floor(z / step) * (width / step);
            terrainMatrix[index] = [x, z]; 
        }
        
    }
    return terrainMatrix;
}








function genChunkForLOD( center , lod,i){
    const { width: terrainWidth, maxHeight, lods, chunkSize } = terrain;
    const width = chunkSize
    const height = chunkSize;

    const widthSegments = Math.pow(2, lods - lod); // if lod = 1 . 2^4 = 16
    const heightSegments = Math.pow(2, lods - lod);

    const width_half = width / 2;
    const height_half = height / 2;

    const gridX = Math.floor( widthSegments );
    const gridY = Math.floor( heightSegments );

    const gridX1 = gridX + 1; // why this: 
    const gridY1 = gridY + 1;

    const segment_width = width / gridX;
    const segment_height = height / gridY;
    
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];



    for ( let iy = 0; iy < gridY1; iy ++ ) {

        const y = iy * segment_height - height_half;

        for ( let ix = 0; ix < gridX1; ix ++ ) {

            const x = ix * segment_width - width_half;

            // vertices.push( x, - y, 0 ); // fix
            vertices.push(x,Math.min(7,5*Noise((center.x+x)*0.1,0,(center.z+y)*0.1)),y)

            // normals.push( 0, 0, 1 );

            // uvs.push( ix / gridX );
            // uvs.push( 1 - ( iy / gridY ) );

        }

    }

    // for ( let iy = 0; iy < gridY; iy ++ ) {

    //     for ( let ix = 0; ix < gridX; ix ++ ) {

    //         const a = ix + gridX1 * iy;
    //         const b = ix + gridX1 * ( iy + 1 );
    //         const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
    //         const d = ( ix + 1 ) + gridX1 * iy;

    //         indices.push( a, b, d );
    //         indices.push( b, c, d );

    //     }

    // }




    fs.writeFileSync(`Data/heightData${lod}-${center.x}x${center.z}.json`, JSON.stringify({vertices,center, lod, index:i}), 'utf8');
    console.log('Height data for LOD generated and saved.', { center, lod});
}

// example gen matx
[
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


// Compare this snippet from node_modules/three/src/geometries/PlaneGeometry.js:
		// const width_half = width / 2;
		// const height_half = height / 2;

		// const gridX = Math.floor( widthSegments );
		// const gridY = Math.floor( heightSegments );

		// const gridX1 = gridX + 1;
		// const gridY1 = gridY + 1;

		// const segment_width = width / gridX;
		// const segment_height = height / gridY;

		// //

		// const indices = [];
		// const vertices = [];
		// const normals = [];
		// const uvs = [];

		// for ( let iy = 0; iy < gridY1; iy ++ ) {

		// 	const y = iy * segment_height - height_half;

		// 	for ( let ix = 0; ix < gridX1; ix ++ ) {

		// 		const x = ix * segment_width - width_half;

		// 		vertices.push( x, - y, 0 );

		// 		normals.push( 0, 0, 1 );

		// 		uvs.push( ix / gridX );
		// 		uvs.push( 1 - ( iy / gridY ) );

		// 	}

		// }

		// for ( let iy = 0; iy < gridY; iy ++ ) {

		// 	for ( let ix = 0; ix < gridX; ix ++ ) {

		// 		const a = ix + gridX1 * iy;
		// 		const b = ix + gridX1 * ( iy + 1 );
		// 		const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
		// 		const d = ( ix + 1 ) + gridX1 * iy;

		// 		indices.push( a, b, d );
		// 		indices.push( b, c, d );

		// 	}

		// }