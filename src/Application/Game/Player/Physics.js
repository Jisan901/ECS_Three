import {Component} from "../../Component.ts"
import * as THREE from 'three';

export default class Physics extends Component{
    constructor(name){
        super(name);
        this.isGrounded = true
    }
    start(){
        const {application, game, camera, RAPIER, world} = this.root.initials;
        this.scene = this.parent.scene;
        let scene = this.scene;
        this.gamePad = game.gamePad;
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(1000.0, 0.01, 1000.0)
        .setTranslation(0,0,0)
        world.createCollider(groundColliderDesc);
        //kinematicVelocityBased
        const characterDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(0, 10, 0);
        let characterRigidBody = world.createRigidBody(characterDesc);
        this.characterRigidBody = characterRigidBody;
        const characterColliderDesc = RAPIER.ColliderDesc.capsule(game.constants.PLAYER_WIDTH, (game.constants.PLAYER_HEIGHT)/2)
        .setMass(50)
        let ccollider = world.createCollider(characterColliderDesc, characterRigidBody);
        this.collider = ccollider;
        let characterController = world.createCharacterController(0.001);
        characterController.setCharacterMass(30)
        characterController.enableAutostep(0.07, 0.03, true);
        characterController.enableSnapToGround(0.07);
        characterController.setApplyImpulsesToDynamicBodies(true);
        this.characterController = characterController;
        console.log(characterRigidBody);
        this.gravity = new RAPIER.Vector3(
        0,
        -9.81,
        0
        );
        this.velocity = characterRigidBody.linvel()
        this.isJumping = false;
        this.jumpVelocity = 0.1;
        this.gamePad.buttons['spacePressed'].onClick = ()=>{
            if (this.isGrounded) {
                this.jumpVelocity = 0.4;
                this.isJumping = true;
                this.maxJumpHeight = 10;
            }
        }
        this.maxJumpHeight = 5
        this.verticalVelocity = -0.8
    }
    updatePosition(nextPos){
        
        let verticalVelocity = this.verticalVelocity;
        let characterController = this.characterController
        let moveVector = nextPos.multiplyScalar(1)//.add(this.gravity)
        this.isGrounded = characterController.computedGrounded()
        if (this.isGrounded) {
            //verticalVelocity = -0.981;
            
            if (this.isJumping) {
                //this.jumpVelocity = 0.5
                this.maxJumpHeight -= this.jumpVelocity;
                this.verticalVelocity = this.jumpVelocity;
                if(this.maxJumpHeight < 1){
                  this.isJumping = false;
                }
            }
        }
        else {
            //verticalVelocity = this.jumpVelocity;
            this.maxJumpHeight -= this.jumpVelocity;
            if(this.maxJumpHeight < 1 && this.isJumping){
                this.isJumping = false;
                this.verticalVelocity = -0.5
            }
            //verticalVelocity = -0.981;  // Apply gravity
        }
        moveVector.y = verticalVelocity;
        characterController.computeColliderMovement(
            this.collider,
            moveVector
        );
        
        let correctedMovement = characterController.computedMovement();
        //console.log(correctedMovement.y=-9.8);
        let newPos = this.characterRigidBody.translation();
        newPos.x += correctedMovement.x;
        newPos.y += correctedMovement.y;
        newPos.z += correctedMovement.z;
        this.characterRigidBody.setNextKinematicTranslation(newPos);
        this.velocity = this.characterRigidBody.linvel()
        //this.characterRigidBody.setLinvel(correctedMovement,true)
        //const characterPosition = this.characterRigidBody.translation();
        return newPos;
    }
    //repeat(t){}
}