<script setup lang="ts">
import { NProgress, NSpin, NText } from 'naive-ui';

defineProps<{
    isLoading: boolean;
    progress: number;
}>();
</script>

<template>
    <Transition name="fade">
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <n-spin size="large" />
                <n-text class="loading-text">模型加载中...</n-text>
                <n-progress type="line" :percentage="progress" :show-indicator="true" :height="8" :border-radius="4"
                    indicator-placement="outside" style="width: 280px; margin-top: 16px;" />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.loading-text {
    font-size: 18px;
    color: #fff;
    margin-top: 8px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
