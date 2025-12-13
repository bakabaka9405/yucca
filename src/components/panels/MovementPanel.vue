<script setup lang="ts">
import { NSpace, NText, NSelect, NSlider, NInputNumber, NGrid, NGi } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';

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
} = storeToRefs(store);

const movementOptions = [
    { label: '飞行', value: 'fly' },
    { label: '轨道', value: 'orbit' },
    { label: '第三人称', value: 'thirdPerson' },
    { label: '俯视', value: 'topView' }
];
</script>

<template>
    <n-space vertical size="large">
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
    </n-space>
</template>
