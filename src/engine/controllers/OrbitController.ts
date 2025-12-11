import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MovementController } from './MovementController';

export class OrbitController implements MovementController {
    private controls: OrbitControls;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enabled = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.35;
        this.controls.target.set(0, 0, 0);
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.enablePan = true;
    }

    enter() {
        this.controls.enabled = true;
    }

    leave() {
        this.controls.enabled = false;
    }

    update(deltaTime: number) {
        this.controls.update();
    }

    dispose() {
        this.controls.dispose();
    }
    
    setTarget(target: THREE.Vector3) {
        this.controls.target.copy(target);
    }
}
