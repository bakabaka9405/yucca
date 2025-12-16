<script setup lang="ts">
import { NSpace, NText, NSwitch } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';

const store = useSceneStore();
const {
    collisionEnabled,
    showCollisionBoxes,
    rendererInfo,
} = storeToRefs(store);
</script>

<template>
    <n-space vertical size="large">
        <!-- 渲染器信息 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px;">渲染后端：{{ rendererInfo }}</n-text>
        </n-space>

        <!-- 碰撞 -->
        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px;">碰撞</n-text>
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

        <n-space vertical size="small">
            <n-text depth="2" style="font-size: 12px;">性能统计</n-text>
            <n-space align="center">
                <n-switch v-model:value="store.statsVisible" />
                <n-text>显示 Stats</n-text>
            </n-space>
        </n-space>
    </n-space>
</template>
