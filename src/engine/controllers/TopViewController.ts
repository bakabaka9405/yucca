import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MovementController } from './MovementController';

export class TopViewController implements MovementController {
    private camera: THREE.Camera;
    private controls: OrbitControls;
    private isAnimating = false;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.enabled = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.35;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = 0.01; // Lock to top view
        this.controls.enablePan = true;
        this.controls.screenSpacePanning = true; // Pan in XZ plane
    }

    enter() {
        this.controls.enabled = true;
        this.animateToTopView();
    }

    leave() {
        this.controls.enabled = false;
        this.isAnimating = false;
    }

    update(deltaTime: number) {
        if (!this.isAnimating) {
            this.controls.update(deltaTime);
        }
    }

    dispose() {
        this.controls.dispose();
    }

    private animateToTopView() {
        this.isAnimating = true;

        const startPos = this.camera.position.clone();
        const startDirection = new THREE.Vector3();
        this.camera.getWorldDirection(startDirection).normalize();
        const startTarget = startPos.clone().add(startDirection);
        const endTarget = new THREE.Vector3(startDirection.x, 0, startDirection.z);

        const targetPos = new THREE.Vector3(0, 20, 0);

        const duration = 1000;
        const startTime = performance.now();

        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;

        const animate = () => {
            if (!this.controls.enabled) return;

            const now = performance.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 3 * Math.pow(progress, 2) - 2 * Math.pow(progress, 3);

            this.camera.position.lerpVectors(startPos, targetPos, ease);
            this.controls.target.lerpVectors(startTarget, endTarget, ease);
            this.camera.lookAt(this.controls.target);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.controls.minPolarAngle = 0;
                this.controls.maxPolarAngle = 0.1;
            }
        };
        animate();
    }
}
