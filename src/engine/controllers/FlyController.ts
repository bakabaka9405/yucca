import * as THREE from 'three/webgpu';
import { Ref, ref } from 'vue';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { MovementController } from './MovementController';
import { useSceneStore } from '../../stores/sceneStore';
import { storeToRefs } from 'pinia';

export class FlyController implements MovementController {
    private camera: THREE.Camera;
    private domElement: HTMLElement;
    private controls: PointerLockControls;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;

    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    private moveVector = new THREE.Vector3();
    private tempRight = new THREE.Vector3();
    private tempForward = new THREE.Vector3();
    private moveSpeed: Ref<number> = ref(0);

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.controls = new PointerLockControls(camera, domElement);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    enter() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.domElement.addEventListener('click', this.onClick);
        this.controls.connect(this.domElement);
        this.controls.lock();
        const { moveSpeed } = storeToRefs(useSceneStore());
        this.moveSpeed = moveSpeed;
    }

    leave() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('click', this.onClick);
        this.controls.unlock();
        this.controls.disconnect();
    }

    update(deltaTime: number) {
        if (this.controls.isLocked) {
            this.velocity.multiplyScalar(Math.exp(-5.0 * deltaTime));

            this.direction.set(
                Number(this.moveRight) - Number(this.moveLeft),
                Number(this.moveUp) - Number(this.moveDown),
                Number(this.moveForward) - Number(this.moveBackward)
            );

            if (this.direction.lengthSq() > 0) {
                this.direction.normalize();

                this.camera.getWorldDirection(this.tempForward).normalize();
                this.tempRight.crossVectors(this.tempForward, new THREE.Vector3(0, 1, 0)).normalize();

                this.moveVector.copy(this.tempForward).multiplyScalar(this.direction.z);
                this.moveVector.addScaledVector(this.tempRight, this.direction.x);
                this.moveVector.y += this.direction.y;
                this.moveVector.normalize();
                this.velocity.addScaledVector(this.moveVector, this.moveSpeed.value * deltaTime);
            }

            this.camera.position.addScaledVector(this.velocity, deltaTime);
        }
    }

    dispose() {
        this.controls.dispose();
    }

    private onClick() {
        if (!this.controls.isLocked) {
            this.controls.lock();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
            case 'Space': this.moveUp = true; break;
            case 'ShiftLeft': case 'ShiftRight': this.moveDown = true; break;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
            case 'Space': this.moveUp = false; break;
            case 'ShiftLeft': case 'ShiftRight': this.moveDown = false; break;
        }
    }

    setLocked(locked: boolean) {
        if (locked) {
            this.controls.lock();
        } else {
            this.controls.unlock();
        }
    }
}
