<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';
import viewer from '../viewer';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { NConfigProvider, darkTheme, type GlobalTheme } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import LoadingOverlay from './LoadingOverlay.vue';
import PointerLockPrompt from './PointerLockPrompt.vue';
import ControlPanel from './ControlPanel.vue';

const store = useSceneStore();
const {
    isLoading,
    loadingProgress,
    isDarkMode,
    modelScale,
    movementMode,
    moveSpeed,
    cameraPosition,
    cameraDirection,
    isEditingPosition,
    isEditingDirection,
    skyboxEnabled,
    sunEnabled,
    sunColor,
    sunIntensity,
    sunPositionX,
    sunPositionY,
    sunPositionZ,
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

// 主题
const theme = computed<GlobalTheme | null>(() => isDarkMode.value ? darkTheme : null);

// 加载天空盒
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('/cubeMap/');
const skyboxTexture = cubeTextureLoader.load([
    'xp.jpg', 'xn.jpg',
    'yp.jpg', 'yn.jpg',
    'zp.jpg', 'zn.jpg'
]);
viewer.scene.background = skyboxTexture;

// 太阳光（平行光）
const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
sunLight.position.set(500, 1000, 500);
sunLight.castShadow = true;
sunLight.shadow.normalBias = 0.05;
viewer.scene.add(sunLight);

// 全局环境光
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
viewer.scene.add(ambientLight);

// 从摄像机射出的聚光灯
const spotLight = new THREE.SpotLight(0xFFFFFF, 1);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.normalBias = 0.05;
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.decay = 1;
spotLight.distance = 1000;
viewer.camera.add(spotLight);
spotLight.position.set(0, 0, 0);
spotLight.target.position.set(0, 0, -1);
viewer.camera.add(spotLight.target);
viewer.scene.add(viewer.camera);

modelScale.value = viewer.getModelScale();
movementMode.value = viewer.getMovementMode();
moveSpeed.value = viewer.getMoveSpeed();

const isLocked = ref(false);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/')
dracoLoader.setDecoderConfig({ type: "wasm" });
dracoLoader.preload();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
    'models/scene.gltf',
    (gltf) => {
        gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        viewer.scene.add(gltf.scene);
        viewer.registerModel(gltf.scene);
        viewer.setModelScale(modelScale.value);

        // 保存模型根节点引用
        store.setModelRoot(gltf.scene);

        isLoading.value = false;
    },
    (progress) => {
        if (progress.lengthComputable) {
            loadingProgress.value = Math.round((progress.loaded / progress.total) * 100);
        }
    },
    (error) => {
        console.error('模型加载失败:', error);
        isLoading.value = false;
    }
);

const handleLock = () => (isLocked.value = true);
const handleUnlock = () => (isLocked.value = false);

const enterPointerLock = () => {
    if (movementMode.value === 'fly') {
        viewer.lockPointer();
    }
};

const syncCameraState = () => {
    if (!isEditingPosition.value) {
        store.updateCameraPosition(
            Number(viewer.camera.position.x.toFixed(2)),
            Number(viewer.camera.position.y.toFixed(2)),
            Number(viewer.camera.position.z.toFixed(2))
        );
    }
    if (!isEditingDirection.value) {
        const dir = viewer.getCameraDirection();
        store.updateCameraDirection(
            Number(dir.x.toFixed(3)),
            Number(dir.y.toFixed(3)),
            Number(dir.z.toFixed(3))
        );
    }
};

watch(cameraPosition, (pos) => {
    if (isEditingPosition.value) {
        const position = new THREE.Vector3(pos.x, pos.y, pos.z);
        viewer.setCameraPosition(position);
    }
}, { deep: true });

watch(cameraDirection, (dir) => {
    if (isEditingDirection.value) {
        const direction = new THREE.Vector3(dir.x, dir.y, dir.z);
        if (direction.lengthSq() > 0) {
            viewer.setCameraDirection(direction);
        }
    }
}, { deep: true });

const showPointerPrompt = computed(() => movementMode.value === 'fly' && !isLocked.value);

watch(movementMode, (mode) => {
    viewer.setMovementMode(mode);
}, { immediate: true });

watch(moveSpeed, (speed) => {
    viewer.setMoveSpeed(speed);
}, { immediate: true });

watch(modelScale, (scale) => {
    viewer.setModelScale(scale);
}, { immediate: true });

// 天空盒控制
watch(skyboxEnabled, (enabled) => {
    viewer.scene.background = enabled ? skyboxTexture : null;
}, { immediate: true });

// 太阳光控制
watch(sunEnabled, (enabled) => {
    sunLight.visible = enabled;
}, { immediate: true });

watch(sunColor, (color) => {
    sunLight.color.set(color);
}, { immediate: true });

watch(sunIntensity, (intensity) => {
    sunLight.intensity = intensity;
}, { immediate: true });

watch([sunPositionX, sunPositionY, sunPositionZ], ([x, y, z]) => {
    sunLight.position.set(x, y, z);
}, { immediate: true });

// 环境光控制
watch(ambientEnabled, (enabled) => {
    ambientLight.visible = enabled;
}, { immediate: true });

watch(ambientColor, (color) => {
    ambientLight.color.set(color);
}, { immediate: true });

watch(ambientIntensity, (intensity) => {
    ambientLight.intensity = intensity;
}, { immediate: true });

// 聚光灯控制
watch(spotEnabled, (enabled) => {
    spotLight.visible = enabled;
}, { immediate: true });

watch(spotColor, (color) => {
    spotLight.color.set(color);
}, { immediate: true });

watch(spotIntensity, (intensity) => {
    spotLight.intensity = intensity;
}, { immediate: true });

watch(spotAngle, (angle) => {
    spotLight.angle = (angle * Math.PI) / 180;
}, { immediate: true });

watch(spotPenumbra, (penumbra) => {
    spotLight.penumbra = penumbra;
}, { immediate: true });

watch(spotDecay, (decay) => {
    spotLight.decay = decay;
}, { immediate: true });

watch(spotDistance, (distance) => {
    spotLight.distance = distance;
}, { immediate: true });

let cameraSyncInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    const { controls } = viewer;
    controls.addEventListener('lock', handleLock);
    controls.addEventListener('unlock', handleUnlock);
    syncCameraState();

    cameraSyncInterval = setInterval(syncCameraState, 200);
});

onBeforeUnmount(() => {
    const { controls } = viewer;
    controls.removeEventListener('lock', handleLock);
    controls.removeEventListener('unlock', handleUnlock);

    if (cameraSyncInterval !== null) {
        clearInterval(cameraSyncInterval);
        cameraSyncInterval = null;
    }
});

</script>

<template>
    <n-config-provider :theme="theme">
        <LoadingOverlay :isLoading="isLoading" :progress="loadingProgress" />

        <div class="ui-layer">
            <PointerLockPrompt :visible="showPointerPrompt" @enterPointerLock="enterPointerLock" />

            <ControlPanel />
        </div>
    </n-config-provider>
</template>

<style scoped>
.ui-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
}
</style>
