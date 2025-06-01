import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three/webgpu'

export type Rendering = {
    renderer: THREE.WebGPURenderer;
    camera: THREE.PerspectiveCamera;
    render: (scene: THREE.Scene) => void;
}


export default function setUpThree() {
    // Set up renderer
    const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#2b343a");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        5000
    );
    camera.position.set(0, 0, -10);

    const debugCamera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        5000
    );
    debugCamera.position.set(0, 0, -10);

    //const controls = new OrbitControls(debugCamera, document.body);
   // controls.update();
    function render(scene: THREE.Scene) {
        renderer.renderAsync(scene, camera);
        //controls.update()
    }

    // Handle resizing
    window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        debugCamera.aspect = width / height;
        debugCamera.updateProjectionMatrix();
    });

    // Return essentials
    return {
        renderer,
        camera,
        render,
        // controls // return if using
    };
}