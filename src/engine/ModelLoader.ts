import * as THREE from 'three/webgpu';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export class ModelLoader {
    private gltfLoader: GLTFLoader;
    private fbxLoader: FBXLoader;
    private dracoLoader: DRACOLoader;
    private ktx2Loader: KTX2Loader;

    constructor(renderer: THREE.WebGPURenderer) {
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();

        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('draco/');
        this.dracoLoader.setDecoderConfig({ type: "wasm" });
        this.dracoLoader.preload();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        if (renderer.initialized === false) {
            console.warn('ModelLoader 的 KTX2Loader 初始化需要在 renderer 初始化之后进行。\n 如果看到这条警告，可能 ModelLoader 实例化太早了。');
        }

        this.ktx2Loader = new KTX2Loader();
        this.ktx2Loader.setTranscoderPath('basis/');
        this.ktx2Loader.detectSupport(renderer);
        this.gltfLoader.setKTX2Loader(this.ktx2Loader);
    }

    public loadGLTF(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf: GLTF) => {
                    resolve(gltf);
                },
                onProgress,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public loadFBX(url: string, onProgress?: (event: ProgressEvent) => void): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (object) => {
                    resolve(object);
                },
                onProgress,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public dispose() {
        this.dracoLoader.dispose();
        this.ktx2Loader.dispose();
    }

    updateRenderer(renderer: THREE.WebGPURenderer) {
        this.ktx2Loader.detectSupport(renderer);
    }
}
