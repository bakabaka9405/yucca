import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import type { MovementMode } from '../viewer';
import type * as THREE from 'three';

export const useSceneStore = defineStore('scene', () => {
    // 加载状态 
    const isLoading = ref(true);
    const loadingProgress = ref(0);

    // 主题 
    const isDarkMode = ref(true);

    // 模型相关 
    const modelRoot = ref<THREE.Object3D | null>(null);
    const modelLabelPrefix = ref('KB3D_API_TwoBedroom_A_');
    const modelScale = ref(1);

    // 移动控制 
    const movementMode = ref<MovementMode>('fly');
    const moveSpeed = ref(100);

    // 摄像机 
    const cameraPosition = reactive({ x: 10, y: 10, z: 10 });
    const cameraDirection = reactive({ x: 0, y: 0, z: -1 });
    const isEditingPosition = ref(false);
    const isEditingDirection = ref(false);

    // 天空盒 
    const skyboxEnabled = ref(true);

    // 太阳光 
    const sunEnabled = ref(true);
    const sunColor = ref('#FFFFFF');
    const sunIntensity = ref(1);
    const sunPositionX = ref(500);
    const sunPositionY = ref(1000);
    const sunPositionZ = ref(500);

    // 环境光 
    const ambientEnabled = ref(true);
    const ambientColor = ref('#FFFFFF');
    const ambientIntensity = ref(1);

    // 聚光灯 
    const spotEnabled = ref(false);
    const spotColor = ref('#FFFFFF');
    const spotIntensity = ref(1);
    const spotAngle = ref(30);
    const spotPenumbra = ref(0.3);
    const spotDecay = ref(1);
    const spotDistance = ref(1000);

    // Actions 
    function setLoading(loading: boolean, progress?: number) {
        isLoading.value = loading;
        if (progress !== undefined) {
            loadingProgress.value = progress;
        }
    }

    function setModelRoot(root: THREE.Object3D | null) {
        modelRoot.value = root;
    }

    function updateCameraPosition(x: number, y: number, z: number) {
        cameraPosition.x = x;
        cameraPosition.y = y;
        cameraPosition.z = z;
    }

    function updateCameraDirection(x: number, y: number, z: number) {
        cameraDirection.x = x;
        cameraDirection.y = y;
        cameraDirection.z = z;
    }

    function setSunPosition(x: number, y: number, z: number) {
        sunPositionX.value = x;
        sunPositionY.value = y;
        sunPositionZ.value = z;
    }

    return {
        // 加载状态
        isLoading,
        loadingProgress,
        // 主题
        isDarkMode,
        // 模型
        modelRoot,
        modelLabelPrefix,
        modelScale,
        // 移动控制
        movementMode,
        moveSpeed,
        // 摄像机
        cameraPosition,
        cameraDirection,
        isEditingPosition,
        isEditingDirection,
        // 天空盒
        skyboxEnabled,
        // 太阳光
        sunEnabled,
        sunColor,
        sunIntensity,
        sunPositionX,
        sunPositionY,
        sunPositionZ,
        // 环境光
        ambientEnabled,
        ambientColor,
        ambientIntensity,
        // 聚光灯
        spotEnabled,
        spotColor,
        spotIntensity,
        spotAngle,
        spotPenumbra,
        spotDecay,
        spotDistance,
        // Actions
        setLoading,
        setModelRoot,
        updateCameraPosition,
        updateCameraDirection,
        setSunPosition,
    };
});
