<script setup lang="ts">
import { watch } from 'vue';
import { NSpace, NText, NSelect, NSlider, NInputNumber, NSwitch, NColorPicker, NGrid, NGi } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import viewer from '../engine/Viewer';

const store = useSceneStore();
const {
    movementMode,
    moveSpeed,
    cameraPosition,
    cameraDirection,
    isEditingPosition,
    isEditingDirection,
    playerPosition,
    isEditingPlayerPosition,
    showCollisionBoxes,
    collisionEnabled,
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
    gtaoEnabled,
    gtaoSamples,
    gtaoDistanceExponent,
    gtaoDistanceFallOff,
    gtaoRadius,
    gtaoScale,
    gtaoThickness,
    gtaoAoOnly,
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
    { label: '轨道', value: 'orbit' },
    { label: '第三人称', value: 'thirdPerson' },
    { label: '俯视', value: 'topView' }
];

watch(environmentEnabled, (val) => {
    viewer.setEnvironmentEnabled(val);
});

watch(environmentIntensity, (val) => {
    viewer.setEnvironmentIntensity(val);
});

watch([gtaoEnabled, gtaoSamples, gtaoDistanceExponent, gtaoDistanceFallOff, gtaoRadius, gtaoScale, gtaoThickness, gtaoAoOnly], () => {
    viewer.updateGTAO({
        enabled: gtaoEnabled.value,
        samples: gtaoSamples.value,
        distanceExponent: gtaoDistanceExponent.value,
        distanceFallOff: gtaoDistanceFallOff.value,
        radius: gtaoRadius.value,
        scale: gtaoScale.value,
        thickness: gtaoThickness.value,
        aoOnly: gtaoAoOnly.value
    });
});
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
            <n-slider v-model:value="moveSpeed" :min="1" :max="50" :step="1" />
        </n-space>

        <!-- 调试选项 -->
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

        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px; text-transform: uppercase;">碰撞</n-text>
            <n-space align="center">
                <n-switch v-model:value="collisionEnabled" />
                <n-text>启用碰撞</n-text>
            </n-space>
            <n-space> </n-space>
            <n-space align="center">
                <n-switch v-model:value="showCollisionBoxes" />
                <n-text>显示碰撞箱</n-text>
            </n-space>
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

        <!-- 玩家位置 (仅第三人称) -->
        <n-space vertical size="small" v-if="movementMode === 'thirdPerson'">
            <n-text depth="2" style="font-weight: 600;">玩家位置</n-text>
            <n-grid :cols="3" :x-gap="8">
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">X</n-text>
                        <n-input-number v-model:value="playerPosition.x" size="small" :show-button="false"
                            @focus="isEditingPlayerPosition = true" @blur="isEditingPlayerPosition = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Y</n-text>
                        <n-input-number v-model:value="playerPosition.y" size="small" :show-button="false"
                            @focus="isEditingPlayerPosition = true" @blur="isEditingPlayerPosition = false" />
                    </n-space>
                </n-gi>
                <n-gi>
                    <n-space vertical size="small">
                        <n-text depth="3" style="font-size: 11px;">Z</n-text>
                        <n-input-number v-model:value="playerPosition.z" size="small" :show-button="false"
                            @focus="isEditingPlayerPosition = true" @blur="isEditingPlayerPosition = false" />
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
                            <n-text depth="3" style="font-size: 11px;">X {{ sunPosition.x }}</n-text>
                            <n-slider v-model:value="sunPosition.x" :min="-100" :max="100" :step="1" />
                        </n-space>
                    </n-gi>
                    <n-gi>
                        <n-space vertical size="small">
                            <n-text depth="3" style="font-size: 11px;">Y {{ sunPosition.y }}</n-text>
                            <n-slider v-model:value="sunPosition.y" :min="0" :max="100" :step="1" />
                        </n-space>
                    </n-gi>
                    <n-gi>
                        <n-space vertical size="small">
                            <n-text depth="3" style="font-size: 11px;">Z {{ sunPosition.z }}</n-text>
                            <n-slider v-model:value="sunPosition.z" :min="-100" :max="100" :step="1" />
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
