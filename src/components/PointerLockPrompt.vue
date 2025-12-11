<script setup lang="ts">
import { NCard, NText, NSpace, NButton } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
    visible: boolean;
    mode: string;
}>();

const emit = defineEmits<{
    enterPointerLock: [];
}>();

const title = computed(() => props.mode === 'fly' ? '自由飞行视角' : '第三人称视角');
</script>

<template>
    <n-card v-show="visible" class="controls-overlay" :bordered="false" size="small" :title="title">
        <n-text depth="3">
            <template v-if="mode === 'fly'">
                点击下方按钮以锁定鼠标，使用 <n-text strong>W A S D</n-text> 移动，<n-text strong>空格</n-text> 上升，<n-text
                    strong>Shift</n-text>
                下降，鼠标旋转方向。
            </template>
            <template v-else>
                点击下方按钮以锁定鼠标，使用 <n-text strong>W A S D</n-text> 移动，鼠标旋转视角。
            </template>
        </n-text>
        <n-space vertical style="margin-top: 12px;">
            <n-button type="primary" @click="emit('enterPointerLock')" block>开始体验</n-button>
            <n-text depth="3" style="font-size: 12px;">按 <n-text code>Esc</n-text> 可退出锁定</n-text>
        </n-space>
    </n-card>
</template>

<style scoped>
.controls-overlay {
    position: absolute;
    left: 16px;
    top: 16px;
    max-width: 320px;
    pointer-events: auto;
    backdrop-filter: blur(10px);
}
</style>
