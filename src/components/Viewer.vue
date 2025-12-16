<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import engine from '../engine/Engine';
import viewer from '../engine/Viewer';
import { NConfigProvider, darkTheme, type GlobalTheme } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import LoadingOverlay from './LoadingOverlay.vue';
import PointerLockPrompt from './PointerLockPrompt.vue';
import ControlPanel from './ControlPanel.vue';
import { useViewerSync } from '../composables/useViewerSync';

const store = useSceneStore();
const {
    isLoading,
    loadingProgress,
    isDarkMode,
    movementMode,
    showInteractionPrompt,
    interactionText,
} = storeToRefs(store);

await engine.init();
useViewerSync();

// 主题
const theme = computed<GlobalTheme | null>(() => isDarkMode.value ? darkTheme : null);

const isLocked = ref(false);

const enterPointerLock = () => {
    if (movementMode.value === 'fly' || movementMode.value === 'thirdPerson') {
        engine.lockPointer();
    }
};

const shouldShowPrompt = computed(() => (movementMode.value === 'fly' || movementMode.value === 'thirdPerson') && !isLocked.value);

const onPointerLockChange = () => {
    isLocked.value = document.pointerLockElement === viewer.renderer.domElement;
};

onMounted(() => {
    document.addEventListener('pointerlockchange', onPointerLockChange);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerlockchange', onPointerLockChange);
});

</script>

<template>
    <n-config-provider :theme="theme">
        <LoadingOverlay :isLoading="isLoading" :progress="loadingProgress" />

        <div class="ui-layer">
            <PointerLockPrompt :visible="shouldShowPrompt" :mode="movementMode" @enterPointerLock="enterPointerLock" />

            <div v-if="showInteractionPrompt" class="interaction-prompt">
                {{ interactionText }}
            </div>

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

.interaction-prompt {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 16px;
    pointer-events: none;
    z-index: 100;
}
</style>
