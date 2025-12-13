<script setup lang="ts">
import { NCard, NSpace, NText, NSwitch, NTabs, NTabPane } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import SceneTreePanel from './panels/SceneTreePanel.vue';
import MovementPanel from './panels/MovementPanel.vue';
import LightingPanel from './panels/LightingPanel.vue';
import PostProcessPanel from './panels/PostProcessPanel.vue';
import DebugPanel from './panels/DebugPanel.vue';

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
            <n-tab-pane name="movement" tab="漫游">
                <MovementPanel />
            </n-tab-pane>

            <n-tab-pane name="lighting" tab="光照">
                <LightingPanel />
            </n-tab-pane>

            <n-tab-pane name="postprocess" tab="后期">
                <PostProcessPanel />
            </n-tab-pane>

            <n-tab-pane name="debug" tab="调试">
                <DebugPanel />
            </n-tab-pane>

            <n-tab-pane name="hierarchy" tab="层级" display-directive="show">
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
    width: 360px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    pointer-events: auto;
    backdrop-filter: blur(14px);
}
</style>
