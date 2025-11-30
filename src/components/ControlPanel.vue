<script setup lang="ts">
import { NCard, NSpace, NText, NSwitch, NTabs, NTabPane } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import SceneParamsPanel from './SceneParamsPanel.vue';
import SceneTreePanel from './SceneTreePanel.vue';

const store = useSceneStore();
const { isDarkMode } = storeToRefs(store);
</script>

<template>
    <n-card class="param-panel" :bordered="false" size="small">
        <template #header>
            <n-space align="center" justify="space-between" style="margin: 0; width: 100%;">
                <n-text strong>控制面板</n-text>
                <n-switch v-model:value="isDarkMode" size="small">
                    <template #checked>🌙</template>
                    <template #unchecked>☀️</template>
                </n-switch>
            </n-space>
        </template>

        <n-tabs type="line" animated>
            <!-- 场景调参选项卡 -->
            <n-tab-pane name="params" tab="场景调参">
                <SceneParamsPanel />
            </n-tab-pane>

            <!-- 模型层级选项卡 -->
            <n-tab-pane name="hierarchy" tab="模型层级">
                <SceneTreePanel />
            </n-tab-pane>
        </n-tabs>
    </n-card>
</template>

<style scoped>
.param-panel {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 320px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    pointer-events: auto;
    backdrop-filter: blur(14px);
}
</style>
