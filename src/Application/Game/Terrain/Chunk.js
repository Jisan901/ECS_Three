import {Component} from "../../Component.js"
import * as THREE from 'three';



export default class Chunk extends Component{
    constructor(name){
        super(name);
    }
    start(){
        const {application, game, RAPIER, world} = this.root.initials;
        this.scene = this.parent.scene;
        
    }
    repeat(t){
        
    }
}