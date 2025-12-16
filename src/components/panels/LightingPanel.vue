<script setup lang="ts">
import { NSpace, NText, NSwitch, NSlider, NColorPicker, NGrid, NGi } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';
import Vector3Input from '../Vector3Input.vue';

const store = useSceneStore();
const {
    skyboxEnabled,
    sunEnabled,
    sunColor,
    sunIntensity,
    sunPosition,
    ambientEnabled,
    ambientColor,
    ambientIntensity,
    environmentEnabled,
    environmentIntensity,
    spotEnabled,
    spotColor,
    spotIntensity,
    spotAngle,
    spotPenumbra,
    spotDecay,
    spotDistance,
} = storeToRefs(store);
</script>

<template>
    <n-space vertical size="large">
        <!-- 天空盒 -->
        <n-space vertical size="small">
            <n-space align="center">
                <n-switch v-model:value="skyboxEnabled" />
                <n-text>天空盒</n-text>
            </n-space>
        </n-space>

        <!-- 太阳光 -->
        <n-space vertical size="small">
            <n-space align="center">
                <n-switch v-model:value="sunEnabled" />
                <n-text>太阳光</n-text>
            </n-space>
            <n-grid :cols="2" :x-gap="8" v-show="sunEnabled">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">颜色</n-text>
                        <n-color-picker v-model:value="sunColor" :show-alpha="false" size="small" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">亮度 {{ sunIntensity.toFixed(1) }}</n-text>
                        <n-slider v-model:value="sunIntensity" :min="0" :max="10" :step="0.1" />
                    </n-space>
                </n-gi>
            </n-grid>
            <n-space vertical size="small" v-show="sunEnabled">
                <n-text depth="3" style="font-size: 11px;">光源位置</n-text>
                <Vector3Input v-model:value="sunPosition" />
            </n-space>
        </n-space>

        <!-- 全局环境光 -->
        <n-space vertical size="small">
            <n-space align="center">
                <n-switch v-model:value="ambientEnabled" />
                <n-text>全局环境光</n-text>
            </n-space>
            <n-grid :cols="2" :x-gap="8" v-show="ambientEnabled">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">颜色</n-text>
                        <n-color-picker v-model:value="ambientColor" :show-alpha="false" size="small" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">亮度 {{ ambientIntensity.toFixed(1) }}</n-text>
                        <n-slider v-model:value="ambientIntensity" :min="0" :max="5" :step="0.1" />
                    </n-space>
                </n-gi>
            </n-grid>
        </n-space>

        <!-- 环境光照 -->
        <n-space vertical size="small">
            <n-space align="center">
                <n-switch v-model:value="environmentEnabled" />
                <n-text>环境光照 (RoomEnvironment)</n-text>
            </n-space>
            <n-space vertical size="small" v-show="environmentEnabled">
                <n-text depth="3" style="font-size: 11px;">强度 {{ environmentIntensity.toFixed(1) }}</n-text>
                <n-slider v-model:value="environmentIntensity" :min="0" :max="5" :step="0.1" />
            </n-space>
        </n-space>

        <!-- 摄像机聚光灯 -->
        <n-space vertical size="small">
            <n-space align="center">
                <n-switch v-model:value="spotEnabled" />
                <n-text>摄像机聚光灯</n-text>
            </n-space>
            <n-grid :cols="2" :x-gap="8" v-show="spotEnabled">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">颜色</n-text>
                        <n-color-picker v-model:value="spotColor" :show-alpha="false" size="small" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">亮度 {{ spotIntensity.toFixed(1) }}</n-text>
                        <n-slider v-model:value="spotIntensity" :min="0" :max="100" :step="0.1" />
                    </n-space>
                </n-gi>
            </n-grid>
            <n-grid :cols="2" :x-gap="8" v-show="spotEnabled">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">锥形角度 {{ spotAngle }}°</n-text>
                        <n-slider v-model:value="spotAngle" :min="5" :max="90" :step="1" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">半影 {{ spotPenumbra.toFixed(2) }}</n-text>
                        <n-slider v-model:value="spotPenumbra" :min="0" :max="1" :step="0.01" />
                    </n-space>
                </n-gi>
            </n-grid>
            <n-grid :cols="2" :x-gap="8" v-show="spotEnabled">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">衰减 {{ spotDecay.toFixed(1) }}</n-text>
                        <n-slider v-model:value="spotDecay" :min="0" :max="5" :step="0.1" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">距离 {{ spotDistance }}</n-text>
                        <n-slider v-model:value="spotDistance" :min="0" :max="5000" :step="10" />
                    </n-space>
                </n-gi>
            </n-grid>
        </n-space>
    </n-space>
</template>
