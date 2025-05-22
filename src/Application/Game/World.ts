import * as THREE from "three/webgpu";
import { Component } from "../Component";
import type { WorldComponent } from "./WorldRenderer.js";




//import Player from './Player/Player.js';

export default class World extends Component implements WorldComponent{
    public scene: THREE.Scene;
    public loaded: boolean;
    

    constructor(name:string){
        super(name);
        this.scene = new THREE.Scene();
        this.loaded = false;
       
    }
    init(){}
    onLoad() {
        if (this.loaded) return;
        this.loaded = true;
        this.start();
        this.components.forEach(component => component.init());
        this.updateNeeded = true;
        
        
        this.root?.initials?.global?.dispatchEvent(new Event('showHud'))
        this.root?.initials?.game?.gamePad.setup()
        
    }
    onExit(){
        
    }
    setup(){
       // this.addComponent(new Player('Player'));
      
        
    }
    start(){
        this.setup();
        const scene = this.scene;
        let light = new THREE.HemisphereLight( 0x86c4ee, 0xe6ba45, 1 );
        let dirlight = new THREE.DirectionalLight( 0xffffff, 5 );
        dirlight.position.set(7,26,5);
        dirlight.castShadow = true
        // dirlight.shadow.camera.near = 0.5; // default
        // dirlight.shadow.camera.far = 500; // default
        dirlight.shadow.camera.bottom = dirlight.shadow.camera.left = -50; // default
        dirlight.shadow.camera.top = dirlight.shadow.camera.right = 50; // default
        
        dirlight.shadow.mapSize.width = 1024*2;
        dirlight.shadow.mapSize.height = 1024*2;
        // scene.add(new THREE.DirectionalLightHelper(dirlight))
        // scene.add(new THREE.CameraHelper(dirlight.shadow.camera))

        scene.add(dirlight);
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(light)
        scene.add(ambientLight)
        //const gridHelper = new THREE.GridHelper( 100, 100 );
        //scene.add( gridHelper );
    
        
    }
}