import * as THREE from 'three/webgpu';
import { useSceneStore } from '../stores/sceneStore';
import { storeToRefs } from 'pinia';
import { watchEffect } from 'vue';

export class LightManager {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private sunLight!: THREE.DirectionalLight;
    private ambientLight!: THREE.AmbientLight;
    private spotLight!: THREE.SpotLight;
    private cameraHelper!: THREE.CameraHelper;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        this.initLights();
        this.setupReactivity();
    }

    private initLights() {
        // 太阳光（平行光）
        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.sunLight.position.set(10, 20, -20);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.bias = -0.0001;
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 50;
        this.sunLight.shadow.camera.left = -20;
        this.sunLight.shadow.camera.right = 20;
        this.sunLight.shadow.camera.top = 20;
        this.sunLight.shadow.camera.bottom = -20;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        this.cameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
        this.scene.add(this.cameraHelper);
        this.cameraHelper.update();

        // 全局环境光
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(this.ambientLight);

        // 从摄像机射出的聚光灯
        this.spotLight = new THREE.SpotLight(0xFFFFFF, 1);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.bias = -0.0001;
        this.spotLight.shadow.normalBias = 0.05;
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.3;
        this.spotLight.decay = 1;
        this.spotLight.distance = 1000;
        this.camera.add(this.spotLight);
        this.spotLight.position.set(0, 0, 0);
        this.spotLight.target.position.set(0, 0, -1);
        this.camera.add(this.spotLight.target);
    }

    private setupReactivity() {
        const store = useSceneStore();
        const {
            sunEnabled,
            sunColor,
            sunIntensity,
            sunPosition,
            ambientEnabled,
            ambientColor,
            ambientIntensity,
            spotEnabled,
            spotColor,
            spotIntensity,
            spotAngle,
            spotPenumbra,
            spotDecay,
            spotDistance,
        } = storeToRefs(store);

        // 太阳光控制
        watchEffect(() => {
            this.sunLight.visible = sunEnabled.value;
            this.sunLight.color.set(sunColor.value);
            this.sunLight.intensity = sunIntensity.value;
            this.sunLight.position.set(sunPosition.value.x, sunPosition.value.y, sunPosition.value.z);
            this.cameraHelper.update();
        });

        // 环境光控制
        watchEffect(() => {
            this.ambientLight.visible = ambientEnabled.value;
            this.ambientLight.color.set(ambientColor.value);
            this.ambientLight.intensity = ambientIntensity.value;
        });

        // 聚光灯控制
        watchEffect(() => {
            this.spotLight.visible = spotEnabled.value;
            this.spotLight.color.set(spotColor.value);
            this.spotLight.intensity = spotIntensity.value;
            this.spotLight.angle = (spotAngle.value * Math.PI) / 180;
            this.spotLight.penumbra = spotPenumbra.value;
            this.spotLight.decay = spotDecay.value;
            this.spotLight.distance = spotDistance.value;
        });
    }
}
