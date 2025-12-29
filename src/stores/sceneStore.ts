import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import type { MovementMode } from '../engine/Engine';
import type * as THREE from 'three';

export type EnvHeatmapLayer = 'temperature' | 'humidity' | 'pm25' | null;

const copyVector3 = (src: THREE.Vector3, dest: { x: number; y: number; z: number }) => {
    dest.x = parseFloat(src.x.toFixed(2));
    dest.y = parseFloat(src.y.toFixed(2));
    dest.z = parseFloat(src.z.toFixed(2));
}

export const useSceneStore = defineStore('scene', () => {
    // 加载状态 
    const isLoading = ref(true);
    const loadingProgress = ref(0);

    // 主题 
    const isDarkMode = ref(true);

    // 模型相关 
    const modelRoot = ref<THREE.Object3D | null>(null);

    // 移动控制 
    const movementMode = ref<MovementMode>('fly');
    const moveSpeed = ref(20);

    // 摄像机 
    const cameraPosition = ref({ x: 1, y: 1, z: 1 });
    const cameraDirection = ref({ x: 0, y: 0, z: -1 });
    const isEditingPosition = ref(false);
    const isEditingDirection = ref(false);

    // 玩家位置
    const playerPosition = ref({ x: 0, y: 0.1, z: 0 });
    const isEditingPlayerPosition = ref(false);

    // 碰撞箱
    const showCollisionBoxes = ref(false);
    const collisionEnabled = ref(true);

    // Stats
    const statsVisible = ref(true);

    // 交互提示
    const showInteractionPrompt = ref(false);
    const interactionText = ref('');

    // 天空盒 
    const skyboxEnabled = ref(true);

    // 热力图
    const showHeatmap = ref(false);

    // 环境热力图（互斥）
    const envHeatmapLayer = ref<EnvHeatmapLayer>(null);

    // 环境数据（真实值，默认舒适）
    const temperatureC = ref(23);
    const humidityRh = ref(50);
    const pm25Ug = ref(12);

    // 舒适区间
    const temperatureComfort = ref({ min: 20, max: 26 });
    const humidityComfort = ref({ min: 40, max: 60 });
    const pm25Comfort = ref({ max: 35 });

    // 太阳光 
    const sunEnabled = ref(true);
    const sunColor = ref('#FFFFFF');
    const sunIntensity = ref(5);
    const sunPosition = ref({ x: 10, y: 20, z: -20 });

    // 环境光 
    const ambientEnabled = ref(false);
    const ambientColor = ref('#FFFFFF');
    const ambientIntensity = ref(1);
    const environmentEnabled = ref(true);
    const environmentIntensity = ref(1);

    // GTAO
    const gtaoEnabled = ref(false);
    const gtaoSamples = ref(16);
    const gtaoDistanceExponent = ref(2);
    const gtaoDistanceFallOff = ref(1);
    const gtaoRadius = ref(0.25);
    const gtaoScale = ref(1);
    const gtaoThickness = ref(1);
    const gtaoAoOnly = ref(false);

    // 聚光灯 
    const spotEnabled = ref(false);
    const spotColor = ref('#FFFFFF');
    const spotIntensity = ref(1);
    const spotAngle = ref(30);
    const spotPenumbra = ref(0.3);
    const spotDecay = ref(1);
    const spotDistance = ref(1000);

    // 渲染器信息
    const rendererInfo = ref('');

    // Actions 
    function setModelRoot(root: THREE.Object3D | null) {
        modelRoot.value = root ? markRaw(root) : null;
    }

    function updateCameraPosition(pos: THREE.Vector3) {
        copyVector3(pos, cameraPosition.value);
    }

    function updateCameraDirection(pos: THREE.Vector3) {
        copyVector3(pos, cameraDirection.value);
    }

    function updatePlayerPosition(pos: THREE.Vector3) {
        copyVector3(pos, playerPosition.value);
    }

    return {
        // 加载状态
        isLoading,
        loadingProgress,

        // 渲染器信息
        rendererInfo,

        // 主题 
        isDarkMode,
        // 模型
        modelRoot,
        // 移动控制
        movementMode,
        moveSpeed,
        // 摄像机
        cameraPosition,
        cameraDirection,
        isEditingPosition,
        isEditingDirection,
        // 玩家位置
        playerPosition,
        isEditingPlayerPosition,
        // 碰撞箱显示
        showCollisionBoxes,
        collisionEnabled,
        // Stats
        statsVisible,
        // 交互提示
        showInteractionPrompt,
        interactionText,
        // 天空盒
        skyboxEnabled,
        showHeatmap,

        // 环境热力图
        envHeatmapLayer,

        // 环境数据
        temperatureC,
        humidityRh,
        pm25Ug,

        // 舒适区间
        temperatureComfort,
        humidityComfort,
        pm25Comfort,
        // 太阳光
        sunEnabled,
        sunColor,
        sunIntensity,
        sunPosition,
        // 环境光
        ambientEnabled,
        ambientColor,
        ambientIntensity,
        environmentEnabled,
        environmentIntensity,
        // GTAO
        gtaoEnabled,
        gtaoSamples,
        gtaoDistanceExponent,
        gtaoDistanceFallOff,
        gtaoRadius,
        gtaoScale,
        gtaoThickness,
        gtaoAoOnly,
        // 聚光灯
        spotEnabled,
        spotColor,
        spotIntensity,
        spotAngle,
        spotPenumbra,
        spotDecay,
        spotDistance,
        // Actions
        setModelRoot,
        updateCameraPosition,
        updateCameraDirection,
        updatePlayerPosition,
    };
});
