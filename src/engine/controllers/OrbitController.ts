import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MovementController } from './MovementController';

export class OrbitController implements MovementController {
    private controls: OrbitControls;
    private camera: THREE.Camera;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.setupControls();
    }

    private setupControls() {
        this.controls.enabled = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.35;
        this.controls.target.set(0, 0, 0);
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.enablePan = true;
    }

    setDomElement(domElement: HTMLElement) {
        const enabled = this.controls.enabled;
        const target = this.controls.target.clone();
        
        this.controls.dispose();
        this.controls = new OrbitControls(this.camera, domElement);
        this.setupControls();
        
        this.controls.target.copy(target);
        this.controls.enabled = enabled;
    }

    enter() {
        this.controls.enabled = true;
    }

    leave() {
        this.controls.enabled = false;
    }

    update(deltaTime: number) {
        this.controls.update(deltaTime);
    }

    dispose() {
        this.controls.dispose();
    }

    setTarget(target: THREE.Vector3) {
        this.controls.target.copy(target);
    }
}
