import * as THREE from 'three/webgpu';
import { ModelLoader } from './ModelLoader';

export class Character {
    public mesh: THREE.Object3D | null = null;
    public velocity: THREE.Vector3 = new THREE.Vector3();
    public mixer: THREE.AnimationMixer | null = null;

    private idleAction: THREE.AnimationAction | null = null;
    private walkAction: THREE.AnimationAction | null = null;
    private currentAction: THREE.AnimationAction | null = null;

    constructor() { }

    private setupMeshProperties(object: THREE.Object3D) {
        object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                const oldMat = mesh.material as THREE.MeshPhongMaterial;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: oldMat.color,
                    map: oldMat.map,
                    roughness: 0.8,
                    metalness: 0.1,
                });
            }
        });
    }

    public async load(loader: ModelLoader, modelUrl: string, walkUrl: string, onProgress?: (progress: ProgressEvent) => void) {
        const reportProgress = (phase: number, e: ProgressEvent) => {
            if (!onProgress) return;
            if (e.lengthComputable && e.total > 0) {
                const percent = e.loaded / e.total;
                const overall = (phase * 0.5) + (percent * 0.5);
                onProgress(new ProgressEvent('progress', {
                    lengthComputable: true,
                    loaded: overall * 100,
                    total: 100
                }));
            }
        };

        // Load model
        const idleObject = await loader.loadFBX(modelUrl, (e) => reportProgress(0, e));
        this.mesh = idleObject;

        // Setup mesh properties
        idleObject.scale.set(0.01, 0.01, 0.01);
        idleObject.position.set(0, 0.1, 0);
        this.setupMeshProperties(idleObject);

        // Setup mixer and idle action
        this.mixer = new THREE.AnimationMixer(idleObject);
        this.idleAction = this.mixer.clipAction(idleObject.animations[0]);
        this.idleAction.play();
        this.currentAction = this.idleAction;

        // Load walk animation
        const walkingObject = await loader.loadFBX(walkUrl, (e) => reportProgress(1, e));
        this.setupMeshProperties(walkingObject);

        this.walkAction = this.mixer.clipAction(walkingObject.animations[0]);
    }

    public update(delta: number) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.updateAnimation();
    }

    private updateAnimation() {
        if (!this.idleAction || !this.walkAction) return;

        const speed = this.velocity.length();
        const isMoving = speed > 1;
        const targetAction = isMoving ? this.walkAction : this.idleAction;

        if (this.currentAction !== targetAction) {
            if (this.currentAction) {
                this.currentAction.fadeOut(0.2);
            }
            targetAction.reset().fadeIn(0.2).play();
            this.currentAction = targetAction;
        }
    }
}
