import * as THREE from 'three/webgpu';
import { MovementController } from './MovementController';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { useSceneStore } from '../../stores/sceneStore';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { Character } from '../Character';
import { doorManager } from '../DoorManager';

export class ThirdPersonController implements MovementController {
    private camera: THREE.Camera;
    private domElement: HTMLElement;
    private thirdPersonCamera: ThirdPersonCamera;

    private playerMesh: THREE.Object3D | null = null;
    private playerVelocity: THREE.Vector3;
    private playerDirection = new THREE.Vector3();

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;

    private tempForward = new THREE.Vector3();
    private tempRight = new THREE.Vector3();
    private collider: THREE.Mesh | null = null;
    private moveSpeed: Ref<number> = ref(0);
    private collisionEnabled: Ref<boolean> = ref(true);

    constructor(
        camera: THREE.Camera,
        domElement: HTMLElement,
        playerVelocity: THREE.Vector3
    ) {
        this.camera = camera;
        this.domElement = domElement;
        this.playerVelocity = playerVelocity;

        this.thirdPersonCamera = new ThirdPersonCamera(camera, domElement);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    setCharacter(character: Character) {
        if (character.mesh) {
            this.setPlayerMesh(character.mesh);
        }
        this.playerVelocity = character.velocity;
    }

    setPlayerMesh(mesh: THREE.Object3D) {
        this.playerMesh = mesh;
        this.thirdPersonCamera.setTarget(mesh);
    }

    setCollider(collider: THREE.Mesh) {
        this.collider = collider;
        this.thirdPersonCamera.setCollider(collider);
    }

    enter() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.domElement.addEventListener('click', this.onClick);

        if (this.playerMesh) {
            this.thirdPersonCamera.syncWithCamera();
        }
        const { moveSpeed, collisionEnabled } = storeToRefs(useSceneStore());
        this.moveSpeed = moveSpeed;
        this.collisionEnabled = collisionEnabled;
    }

    leave() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('click', this.onClick);
        this.thirdPersonCamera.setLocked(false);
        if (document.pointerLockElement === this.domElement) {
            document.exitPointerLock();
        }
    }

    update(deltaTime: number) {
        this.handleInput(deltaTime);
        this.updatePlayer(deltaTime);
        this.thirdPersonCamera.update(deltaTime);
        if (this.playerMesh) {
            doorManager.update(this.playerMesh.position);
        }
    }

    dispose() {
        this.thirdPersonCamera.dispose();
    }

    private onClick() {
        if (!document.pointerLockElement) {
            this.domElement.requestPointerLock();
            this.thirdPersonCamera.setLocked(true);
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
            case 'KeyF': doorManager.interact(); break;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
        }
    }

    private handleInput(deltaTime: number) {
        if (!this.playerMesh) return;
        this.camera.getWorldDirection(this.tempForward);
        this.tempForward.y = 0;
        this.tempForward.normalize();
        this.tempRight.crossVectors(this.tempForward, this.camera.up).normalize();

        this.playerDirection.set(0, 0, 0);

        if (this.moveForward) this.playerDirection.add(this.tempForward);
        if (this.moveBackward) this.playerDirection.sub(this.tempForward);
        if (this.moveRight) this.playerDirection.add(this.tempRight);
        if (this.moveLeft) this.playerDirection.sub(this.tempRight);

        if (this.playerDirection.lengthSq() > 0) {
            this.playerDirection.normalize();
            this.playerVelocity.add(this.playerDirection.multiplyScalar(this.moveSpeed.value * deltaTime));

            const targetRotation = Math.atan2(this.playerDirection.x, this.playerDirection.z);
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
            this.playerMesh.quaternion.slerp(q, 0.2);
        }
    }

    private updatePlayer(deltaTime: number) {
        if (!this.playerMesh) return;

        let damping = Math.exp(-4 * deltaTime) - 1;
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);

        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);

        if (this.collider && this.collisionEnabled.value) {
            this.resolveCollisions(deltaPosition);
            doorManager.checkCollision(this.playerMesh.position, 0.15, deltaPosition);
        }

        this.playerMesh.position.add(deltaPosition);
    }

    private resolveCollisions(deltaPosition: THREE.Vector3) {
        if (!this.playerMesh || !this.collider) return;

        const radius = 0.15;
        const centerOffset = new THREE.Vector3(0, 0.2, 0);
        const tempPos = this.playerMesh.position.clone().add(centerOffset).add(deltaPosition);

        const bvh = (this.collider.geometry as any).boundsTree;
        if (!bvh) return;

        const tempVector = new THREE.Vector3();

        for (let i = 0; i < 5; i++) {
            bvh.shapecast({
                intersectsBounds: (box: THREE.Box3) => {
                    const boxToSphere = box.distanceToPoint(tempPos);
                    return boxToSphere < radius;
                },
                intersectsTriangle: (tri: any) => {
                    const dist = tri.closestPointToPoint(tempPos, tempVector).distanceTo(tempPos);
                    if (dist < radius) {
                        const depth = radius - dist;
                        const normal = tempPos.clone().sub(tempVector).normalize();
                        normal.y = 0;
                        tempPos.addScaledVector(normal, depth);
                    }
                }
            });
        }

        const newPos = tempPos.clone().sub(centerOffset);
        deltaPosition.copy(newPos).sub(this.playerMesh.position);
    }

    setLocked(locked: boolean) {
        this.thirdPersonCamera.setLocked(locked);
        if (locked) {
            this.domElement.requestPointerLock();
        } else {
            if (document.pointerLockElement === this.domElement) {
                document.exitPointerLock();
            }
        }
    }
}
