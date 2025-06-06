import type GUI from "lil-gui";
import { ECS } from "./bootstrap";
import { Vector3 } from "three";

/*
    * Global.ts
    * This file defines a Global class that can be used to store readonly or public global variables or configurations.
    * It is currently empty but can be extended in the future.
    *
    * @module ECS/Utils/Global
    * @version 1.0.0
    * @since 1.0.0
*/
export class Global{
    // define . use Esc.instance.global.VariableName to access these variables
    public isGrounded: boolean = true;
    public playerPosition = new Vector3()









    private _isDebug: boolean = false;
    private _globalFolder?: GUI;
    constructor () {
        // useless
    }
    _useGUIDebug(){
        if (this._globalFolder) return; // already initialized
        const lil = ECS.instance.lil;
        this._globalFolder = lil.addFolder('Global');
        // auto map every prop .
        // Object.getOwnPropertyNames(this).forEach((prop) => {
        //     if (prop.startsWith('_')) return; // skip private properties
        //     this._globalFolder?.add(this, (prop as keyof this)).name(prop);
        // });
    }
}