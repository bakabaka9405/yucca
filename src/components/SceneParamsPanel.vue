<script setup lang="ts">
import { NSpace, NText, NSelect, NSlider, NGrid, NGi, NInputNumber, NSwitch, NColorPicker } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';

const store = useSceneStore();
const {
    movementMode,
    moveSpeed,
    modelScale,
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

const movementOptions = [
    { label: '飞行', value: 'fly' },
    { label: '轨道', value: 'orbit' }
];
</script>

<template>
    <n-text depth="3">实时调整移动方式、摄像机与光照参数。</n-text>

    <n-space vertical size="large" style="margin-top: 16px;">
        <!-- 移动方式 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px; text-transform: uppercase;">移动方式</n-text>
            <n-select v-model:value="movementMode" :options="movementOptions" />
        </n-space>

        <!-- 移动速度 -->
        <n-space vertical size="small">
            <n-space justify="space-between" style="width: 100%;">
                <n-text depth="2" style="font-size: 12px; text-transform: uppercase;">移动速度</n-text>
                <n-text>{{ Math.round(moveSpeed) }} u/s</n-text>
            </n-space>
            <n-slider v-model:value="moveSpeed" :min="10" :max="2000" :step="10" />
        </n-space>

        <!-- 摄像机位置 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-weight: 600;">摄像机位置</n-text>
            <n-grid :cols="3" :x-gap="8">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">X</n-text>
                        <n-input-number v-model:value="cameraPosition.x" size="small" :show-button="false"
                            @focus="isEditingPosition = true" @blur="isEditingPosition = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Y</n-text>
                        <n-input-number v-model:value="cameraPosition.y" size="small" :show-button="false"
                            @focus="isEditingPosition = true" @blur="isEditingPosition = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Z</n-text>
                        <n-input-number v-model:value="cameraPosition.z" size="small" :show-button="false"
                            @focus="isEditingPosition = true" @blur="isEditingPosition = false" />
                    </n-space>
                </n-gi>
            </n-grid>
        </n-space>

        <!-- 摄像机方向 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-weight: 600;">摄像机方向</n-text>
            <n-grid :cols="3" :x-gap="8">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">X</n-text>
                        <n-input-number v-model:value="cameraDirection.x" size="small" :show-button="false"
                            @focus="isEditingDirection = true" @blur="isEditingDirection = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Y</n-text>
                        <n-input-number v-model:value="cameraDirection.y" size="small" :show-button="false"
                            @focus="isEditingDirection = true" @blur="isEditingDirection = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Z</n-text>
                        <n-input-number v-model:value="cameraDirection.z" size="small" :show-button="false"
                            @focus="isEditingDirection = true" @blur="isEditingDirection = false" />
                    </n-space>
                </n-gi>
            </n-grid>
        </n-space>

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
                <n-grid :cols="3" :x-gap="8">
                    <n-gi>
                        <n-space vertical size="small">
                            <n-text depth="3" style="font-size: 11px;">X {{ sunPositionX }}</n-text>
                            <n-slider v-model:value="sunPositionX" :min="-2000" :max="2000" :step="1" />
                        </n-space>
                    </n-gi>
                    <n-gi>
                        <n-space vertical size="small">
                            <n-text depth="3" style="font-size: 11px;">Y {{ sunPositionY }}</n-text>
                            <n-slider v-model:value="sunPositionY" :min="-2000" :max="2000" :step="1" />
                        </n-space>
                    </n-gi>
                    <n-gi>
                        <n-space vertical size="small">
                            <n-text depth="3" style="font-size: 11px;">Z {{ sunPositionZ }}</n-text>
                            <n-slider v-model:value="sunPositionZ" :min="-2000" :max="2000" :step="1" />
                        </n-space>
                    </n-gi>
                </n-grid>
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

        <!-- 模型缩放 -->
        <n-space vertical size="small">
            <n-space justify="space-between" style="width: 100%;">
                <n-text depth="2" style="font-size: 12px; text-transform: uppercase;">模型缩放</n-text>
                <n-text>{{ modelScale.toFixed(2) }}x</n-text>
            </n-space>
            <n-slider v-model:value="modelScale" :min="0.1" :max="5" :step="0.1" />
        </n-space>
    </n-space>
</template>
