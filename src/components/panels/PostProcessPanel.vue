<script setup lang="ts">
import { NSpace, NText, NSwitch, NInputNumber, NGrid, NGi } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';

const store = useSceneStore();
const {
    gtaoEnabled,
    gtaoSamples,
    gtaoDistanceExponent,
    gtaoDistanceFallOff,
    gtaoRadius,
    gtaoScale,
    gtaoThickness,
    gtaoAoOnly,
} = storeToRefs(store);
</script>

<template>
    <n-space vertical size="large">
        <!-- GTAO -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px; text-transform: uppercase;">GTAO</n-text>
            <n-space align="center">
                <n-switch v-model:value="gtaoEnabled" />
                <n-text>启用 GTAO</n-text>
            </n-space>
            <n-space align="center">
                <n-switch v-model:value="gtaoAoOnly" :disabled="!gtaoEnabled" />
                <n-text>仅显示 AO</n-text>
            </n-space>
            
            <n-grid :cols="2" :x-gap="8" :y-gap="8">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Samples</n-text>
                        <n-input-number v-model:value="gtaoSamples" size="small" :min="4" :max="32" :step="1" :show-button="false" />
                    </n-space>
                </n-gi>
                 <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Radius</n-text>
                        <n-input-number v-model:value="gtaoRadius" size="small" :min="0.01" :max="2" :step="0.01" :show-button="false" />
                    </n-space>
                </n-gi>
                 <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Distance Exp</n-text>
                        <n-input-number v-model:value="gtaoDistanceExponent" size="small" :min="1" :max="4" :step="0.1" :show-button="false" />
                    </n-space>
                </n-gi>
                 <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Distance Falloff</n-text>
                        <n-input-number v-model:value="gtaoDistanceFallOff" size="small" :min="0.01" :max="2" :step="0.01" :show-button="false" />
                    </n-space>
                </n-gi>
                 <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Scale</n-text>
                        <n-input-number v-model:value="gtaoScale" size="small" :min="0.01" :max="2" :step="0.01" :show-button="false" />
                    </n-space>
                </n-gi>
                 <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Thickness</n-text>
                        <n-input-number v-model:value="gtaoThickness" size="small" :min="0.01" :max="2" :step="0.01" :show-button="false" />
                    </n-space>
                </n-gi>
            </n-grid>
        </n-space>
    </n-space>
</template>
