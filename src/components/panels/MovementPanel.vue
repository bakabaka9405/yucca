<script setup lang="ts">
import { NSpace, NText, NSelect, NSlider } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';
import Vector3Input from '../Vector3Input.vue';

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
            <n-text depth="2" style="font-size: 12px;">移动方式</n-text>
            <n-select v-model:value="movementMode" :options="movementOptions" />
        </n-space>

        <!-- 移动速度 -->
        <n-space vertical size="small">
            <n-space justify="space-between" style="width: 100%;">
                <n-text depth="2" style="font-size: 12px;">移动速度</n-text>
                <n-text>{{ Math.round(moveSpeed) }} u/s</n-text>
            </n-space>
            <n-slider v-model:value="moveSpeed" :min="1" :max="50" :step="1" />
        </n-space>

        <!-- 摄像机位置 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-weight: 600;">摄像机位置</n-text>
            <Vector3Input v-model:value="cameraPosition" v-model:editing="isEditingPosition" />
        </n-space>

        <!-- 玩家位置 (仅第三人称) -->
        <n-space vertical size="small" v-if="movementMode === 'thirdPerson'">
            <n-text depth="2" style="font-weight: 600;">玩家位置</n-text>
            <Vector3Input v-model:value="playerPosition" v-model:editing="isEditingPlayerPosition" />
        </n-space>

        <!-- 摄像机方向 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-weight: 600;">摄像机方向</n-text>
            <Vector3Input v-model:value="cameraDirection" v-model:editing="isEditingDirection" />
        </n-space>
    </n-space>
</template>
