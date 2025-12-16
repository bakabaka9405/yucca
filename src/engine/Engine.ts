import * as THREE from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MovementController } from './controllers/MovementController';
import { FlyController } from './controllers/FlyController';
import { OrbitController } from './controllers/OrbitController';
import { ThirdPersonController } from './controllers/ThirdPersonController';
import { TopViewController } from './controllers/TopViewController';
import { Character } from './Character';
import { InputManager } from './InputManager';
import { PostProcessing, type GTAOParams } from './PostProcessing';
import { LightManager } from './LightManager';
import { ModelLoader } from './ModelLoader';
import { InfiniteGrid } from './InfiniteGrid';
import { colliderManager } from './ColliderManager';
import { doorManager } from './DoorManager';
import { ASSETS } from '../config/assets';
import viewer from './Viewer';
import { useSceneStore } from '../stores/sceneStore';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Initialize BVH extensions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type MovementMode = 'fly' | 'orbit' | 'thirdPerson' | 'topView';

export class Engine {
    scene: THREE.Scene;
    postProcessing: PostProcessing | null = null;
    gtaoEnabled: boolean = true;

    private controllers: { [key in MovementMode]: MovementController };
    private currentController: MovementController;
    movementMode: MovementMode = 'fly';

    private clock = new THREE.Clock();
    private environmentTexture: THREE.Texture | null = null;
    private mixers: THREE.AnimationMixer[] = [];
    private skyboxTexture: THREE.CubeTexture | null = null;

    public character: Character | null = null;
    public lightManager: LightManager | null = null;
    private modelLoader: ModelLoader | null = null;

    private updateListeners: Set<(delta: number) => void> = new Set();

    constructor() {
        this.scene = new THREE.Scene();

        this.controllers = {
            fly: new FlyController(viewer.camera, viewer.renderer.domElement),
            orbit: new OrbitController(viewer.camera, viewer.renderer.domElement),
            thirdPerson: new ThirdPersonController(viewer.camera, viewer.renderer.domElement, new THREE.Vector3()),
            topView: new TopViewController(viewer.camera, viewer.renderer.domElement)
        };

        this.currentController = this.controllers.fly;
    }

    async init() {
        const store = useSceneStore();

        await viewer.init(); // Initialize renderer
        viewer.onRendererChange(this.handleRendererChange.bind(this));

        // Get renderer backend info
        const renderer = viewer.renderer;
        store.rendererInfo = renderer.backend.constructor.name.replace('Backend', '');

        // Environment setup
        this.setupEnvironment(viewer.renderer);

        // Post-processing setup
        this.postProcessing = new PostProcessing(viewer.renderer, this.scene, viewer.camera);

        // Skybox
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.setPath('cubeMap/');
        const skyboxTexture = cubeTextureLoader.load(ASSETS.textures.skybox);
        this.setSkybox(skyboxTexture);

        // Grid
        const infiniteGrid = new InfiniteGrid();
        this.scene.add(infiniteGrid);

        this.scene.add(viewer.camera);

        // Lights
        this.lightManager = new LightManager(this.scene, viewer.camera);

        // Model Loader
        this.modelLoader = new ModelLoader(viewer.renderer);

        // Load Character
        const loadCharacter = async () => {
            const character = new Character();
            try {
                if (this.modelLoader) {
                    await character.load(this.modelLoader, ASSETS.models.characterIdle, ASSETS.models.characterWalk, (progress) => {
                        if (progress.lengthComputable) {
                            store.loadingProgress = 50 + Math.round((progress.loaded / progress.total) * 50);
                        }
                    });

                    this.setCharacter(character);
                    store.movementMode = 'thirdPerson';
                    store.isLoading = false;
                }
            } catch (error) {
                console.error('Character loading failed:', error);
                store.isLoading = false;
            }
        };

        // Load Home Model
        this.modelLoader.loadGLTF(ASSETS.models.home, (progress) => {
            if (progress.lengthComputable) {
                store.loadingProgress = Math.round((progress.loaded / progress.total) * 50);
            }
        }).then((gltf) => {
            gltf.scene.position.set(0, 0.1, 0);
            this.scene.add(gltf.scene);
            store.setModelRoot(gltf.scene);

            // Update matrices
            gltf.scene.updateMatrixWorld(true);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            this.addMixer(mixer);

            gltf.scene.traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.receiveShadow = true;
                    mesh.castShadow = true;
                    if (mesh.name.endsWith('Glass')) {
                        mesh.castShadow = false;
                    }
                }
            });

            // Doors
            const doorContainer = gltf.scene.getObjectByName('Door');
            if (doorContainer) {
                doorContainer.children.forEach((child: THREE.Object3D) => {
                    doorManager.addDoor(child, gltf.animations, mixer);
                });
            }

            // Colliders
            colliderManager.generateCollider(gltf.scene, this.scene, (collider) => {
                this.setEnvironmentCollider(collider);
            });
            colliderManager.setVisibility(store.showCollisionBoxes);

            loadCharacter();
        }).catch((error) => {
            console.error('模型加载失败:', error);
            store.isLoading = false;
        });

        this.currentController.enter();

        // Start loop
        viewer.renderer.setAnimationLoop(this.animate);
    }

    handleRendererChange(newRenderer: THREE.WebGPURenderer) {
        // Update controllers
        Object.values(this.controllers).forEach(controller => {
            controller.setDomElement(newRenderer.domElement);
        });

        // Update PostProcessing
        this.postProcessing = new PostProcessing(newRenderer, this.scene, viewer.camera);

        // Update ModelLoader
        if (this.modelLoader) {
            this.modelLoader.updateRenderer(newRenderer);
        }

        // Re-setup environment
        this.setupEnvironment(newRenderer);

        // Re-set animation loop
        newRenderer.setAnimationLoop(this.animate);
    }

    private setupEnvironment(renderer: THREE.WebGPURenderer) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        this.scene.environment = this.environmentTexture;
    }

    addMixer(mixer: THREE.AnimationMixer) {
        this.mixers.push(mixer);
    }

    setCharacter(character: Character) {
        this.character = character;
        if (character.mesh) {
            this.scene.add(character.mesh);
            (this.controllers.thirdPerson as ThirdPersonController).setCharacter(character);
        }
    }

    async updateGTAO(params: GTAOParams) {
        if (this.gtaoEnabled !== params.enabled) {
            this.gtaoEnabled = params.enabled;
            await viewer.recreateRenderer(!params.enabled);
        }

        if (this.postProcessing) {
            this.postProcessing.update(params);
        }
    }

    lockPointer() {
        if (this.movementMode === 'fly') {
            (this.currentController as FlyController).setLocked(true);
        } else if (this.movementMode === 'thirdPerson') {
            (this.currentController as ThirdPersonController).setLocked(true);
        }
    }

    unlockPointer() {
        if (this.movementMode === 'fly') {
            (this.currentController as FlyController).setLocked(false);
        } else if (this.movementMode === 'thirdPerson') {
            (this.currentController as ThirdPersonController).setLocked(false);
        }
    }

    setMovementMode(mode: MovementMode) {
        if (this.movementMode === mode) return;

        this.currentController.leave();
        this.movementMode = mode;
        this.currentController = this.controllers[mode];
        this.currentController.enter();
    }

    setCameraPosition(position: THREE.Vector3) {
        viewer.camera.position.copy(position);
    }

    setCameraDirection(direction: THREE.Vector3) {
        if (this.movementMode === 'orbit' || direction.lengthSq() === 0) return;
        viewer.camera.lookAt(direction.add(viewer.camera.position));
    }

    getCameraDirection() {
        const worldDirection = new THREE.Vector3();
        viewer.camera.getWorldDirection(worldDirection);
        return worldDirection;
    }

    onUpdate(callback: (delta: number) => void) {
        this.updateListeners.add(callback);
        return () => this.updateListeners.delete(callback);
    }

    private animate = () => {
        const delta = this.clock.getDelta();

        this.mixers.forEach(mixer => mixer.update(delta));

        this.character?.update(delta);

        this.currentController.update(delta);

        this.updateListeners.forEach(listener => listener(delta));

        viewer.stats.update();

        if (this.postProcessing && this.gtaoEnabled) {
            this.postProcessing.render();
        } else {
            viewer.renderer.render(this.scene, viewer.camera);
        }

        InputManager.getInstance().update();
    };

    dispose() {
        viewer.renderer.setAnimationLoop(null);

        Object.values(this.controllers).forEach(c => c.dispose());

        viewer.dispose(); // Dispose renderer and stats
    }

    setEnvironmentEnabled(enabled: boolean) {
        this.scene.environment = enabled ? this.environmentTexture : null;
    }

    setEnvironmentIntensity(intensity: number) {
        this.scene.environmentIntensity = intensity;
    }

    setEnvironmentCollider(collider: THREE.Object3D) {
        (this.controllers.thirdPerson as ThirdPersonController).setCollider(collider as THREE.Mesh);
    }

    setSkybox(texture: THREE.CubeTexture) {
        this.skyboxTexture = texture;
        this.scene.background = texture;
    }

    setSkyboxEnabled(enabled: boolean) {
        this.scene.background = enabled ? this.skyboxTexture : null;
    }
}

const engine = new Engine();
export default engine;
