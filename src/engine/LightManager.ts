import * as THREE from 'three/webgpu';

export class LightManager {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    public sunLight!: THREE.DirectionalLight;
    public ambientLight!: THREE.AmbientLight;
    public spotLight!: THREE.SpotLight;
    private cameraHelper!: THREE.CameraHelper;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        this.initLights();
    }

    private initLights() {
        // 太阳光（平行光）
        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 5);
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
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
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

    updateSunLight(enabled: boolean, color: string, intensity: number, position: { x: number, y: number, z: number }) {
        this.sunLight.visible = enabled;
        this.sunLight.color.set(color);
        this.sunLight.intensity = intensity;
        this.sunLight.position.set(position.x, position.y, position.z);
        this.cameraHelper.update();
    }

    updateAmbientLight(enabled: boolean, color: string, intensity: number) {
        this.ambientLight.visible = enabled;
        this.ambientLight.color.set(color);
        this.ambientLight.intensity = intensity;
    }

    updateSpotLight(enabled: boolean, color: string, intensity: number, angle: number, penumbra: number, decay: number, distance: number) {
        this.spotLight.visible = enabled;
        this.spotLight.color.set(color);
        this.spotLight.intensity = intensity;
        this.spotLight.angle = (angle * Math.PI) / 180;
        this.spotLight.penumbra = penumbra;
        this.spotLight.decay = decay;
        this.spotLight.distance = distance;
    }
}
