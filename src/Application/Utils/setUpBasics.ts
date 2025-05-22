import * as THREE from 'three/webgpu'

/**
 * Initializes a Three.js scene with Rapier physics.
 */
export default async function setUpThreeRapier() {
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

    const clock = new THREE.Clock();

    // Set up Rapier physics
    const RAPIER = (await import('@dimforge/rapier3d')).default;
    // await RAPIER.init(); // Only needed if you're using the WASM backend manually
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    const world = new RAPIER.World(gravity);

    // Optional: enable OrbitControls for camera
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.update();

    // Render loop (to be called externally)
    function render(scene: THREE.Scene) {
        
        world.step();
        renderer.renderAsync(scene, camera);
        // controls.update(); // Uncomment if using OrbitControls
    }

    // Handle resizing
    window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Return essentials
    return {
        renderer,
        camera,
        world,
        RAPIER,
        render,
        clock,
        // controls // return if using
    };
}
