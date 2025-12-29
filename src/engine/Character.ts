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

    public async load(loader: ModelLoader, modelUrl: string, onProgress?: (progress: ProgressEvent) => void) {

        const charGltf = await loader.loadGLTF(modelUrl, (e) => onProgress && onProgress(e));
        const char = charGltf.scene;
        char.scale.set(0.45, 0.45, 0.45);
        char.position.set(0, 0.1, 0);
        this.setupMeshProperties(char);

        this.mixer = new THREE.AnimationMixer(char);
        this.idleAction = this.mixer.clipAction(charGltf.animations[0]);
        this.idleAction.play();
        this.currentAction = this.idleAction;
        this.mesh = char;
        this.walkAction = this.mixer.clipAction(charGltf.animations[1]);
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
