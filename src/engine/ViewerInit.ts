import { useSceneStore } from '../stores/sceneStore';
import viewer from './Viewer';
import * as THREE from 'three/webgpu';
import { ModelLoader } from './ModelLoader';
import { InfiniteGrid } from './InfiniteGrid';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { LightManager } from './LightManager';
import { Character } from './Character';
import { colliderManager } from './ColliderManager';
import { doorManager } from './DoorManager';
import { ASSETS } from '../config/assets';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export async function initViewerScene() {
    const store = useSceneStore();

    await viewer.init();

    // 加载天空盒
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath('cubeMap/');
    const skyboxTexture = cubeTextureLoader.load(ASSETS.textures.skybox);
    viewer.setSkybox(skyboxTexture);

    const infiniteGrid = new InfiniteGrid();
    viewer.scene.add(infiniteGrid);

    viewer.scene.add(viewer.camera);
    viewer.lightManager = new LightManager(viewer.scene, viewer.camera);

    const modelLoader = new ModelLoader(viewer.renderer);

    async function loadCharacter() {
        const character = new Character();
        try {
            await character.load(modelLoader, ASSETS.models.characterIdle, ASSETS.models.characterWalk, (progress) => {
                if (progress.lengthComputable) {
                    store.loadingProgress = 50 + Math.round((progress.loaded / progress.total) * 50);
                }
            });

            viewer.setCharacter(character);
            store.movementMode = 'thirdPerson';
            store.isLoading = false;
        } catch (error) {
            console.error('Character loading failed:', error);
            store.isLoading = false;
        }
    }

    modelLoader.loadGLTF(ASSETS.models.home, (progress) => {
        if (progress.lengthComputable) {
            store.loadingProgress = Math.round((progress.loaded / progress.total) * 50);
        }
    }).then((gltf) => {
        gltf.scene.position.set(0, 0.1, 0);
        viewer.scene.add(gltf.scene);
        store.setModelRoot(gltf.scene);

        // Update matrices to get correct world matrices
        gltf.scene.updateMatrixWorld(true);

        const mixer = new THREE.AnimationMixer(gltf.scene);
        viewer.addMixer(mixer);

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

        // Initialize doors from the 'Door' container
        const doorContainer = gltf.scene.getObjectByName('Door');
        if (doorContainer) {
            doorContainer.children.forEach((child: THREE.Object3D) => {
                console.log(child.name);
                doorManager.addDoor(child, gltf.animations, mixer);
            });
        }

        colliderManager.generateCollider(gltf.scene);
        colliderManager.setVisibility(store.showCollisionBoxes);

        loadCharacter();
    }).catch((error) => {
        console.error('模型加载失败:', error);
        store.isLoading = false;
    });
}
