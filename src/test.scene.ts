import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 10);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);




const groundMesh = new THREE.Mesh(
    new THREE.BoxGeometry(20, 1, 20),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
);
groundMesh.position.y = -0.5;
// scene.add(groundMesh);











function generateBorderPlane(width=10, height=10, innerSeg=10, borderSeg=11) {
  const totalSegX = innerSeg + 2 * borderSeg;
  const totalSegY = innerSeg + 2 * borderSeg;

  const halfW = width / 2;
  const halfH = height / 2;

  // Compute region sizes
  const borderWidthX = (width / totalSegX) * borderSeg;
  const borderWidthY = (height / totalSegY) * borderSeg;
  const innerWidthX  = width - 2 * borderWidthX;
  const innerWidthY  = height - 2 * borderWidthY;

  // Helper to get coordinate at grid index
  function coordX(i:number) {
    if (i <= borderSeg) {
      return -halfW + (i / borderSeg) * borderWidthX;
    } else if (i >= borderSeg + innerSeg) {
      const k = i - (borderSeg + innerSeg);
      return -halfW + borderWidthX + innerWidthX + (k / borderSeg) * borderWidthX;
    } else {
      const k = i - borderSeg;
      return -halfW + borderWidthX + (k / innerSeg) * innerWidthX;
    }
  }

  function coordY(j:number) {
    if (j <= borderSeg) {
      return -halfH + (j / borderSeg) * borderWidthY;
    } else if (j >= borderSeg + innerSeg) {
      const k = j - (borderSeg + innerSeg);
      return -halfH + borderWidthY + innerWidthY + (k / borderSeg) * borderWidthY;
    } else {
      const k = j - borderSeg;
      return -halfH + borderWidthY + (k / innerSeg) * innerWidthY;
    }
  }

  const verts = [];
  const normals = [];
  const uvs = [];

  // Build vertices
  for (let j = 0; j <= totalSegY; j++) {
    for (let i = 0; i <= totalSegX; i++) {
      const x = coordX(i);
      const y = coordY(j);
      verts.push(x, 0, y);
      normals.push(0, 1, 0);
      uvs.push(i / totalSegX, j / totalSegY);
    }
  }

  // Build indices
  const indices = [];
  for (let j = 0; j < totalSegY; j++) {
    for (let i = 0; i < totalSegX; i++) {
      const a = j * (totalSegX + 1) + i;
      const b = a + 1;
      const c = a + (totalSegX + 1);
      const d = c + 1;
      // two triangles per quad
      indices.push(a, c, b, b, c, d);
    }
  }

  // Create BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  return geometry;
}

const plane = new THREE.Mesh(generateBorderPlane(),new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe:true }))
scene.add(plane)









const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light, new THREE.AmbientLight(0x404040));


const controls = new OrbitControls(camera, document.body);
controls.update();

function animate(){
    controls.update()
    renderer.render(scene,camera)
    requestAnimationFrame(animate)
}
animate()