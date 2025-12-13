<script setup lang="ts">
import { NSpace, NText, NSwitch } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';

const store = useSceneStore();
const {
    collisionEnabled,
    showCollisionBoxes,
} = storeToRefs(store);
</script>

<template>
    <n-space vertical size="large">
        <!-- 碰撞 -->
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
    </n-space>
</template>
