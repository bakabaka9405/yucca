<script setup lang="ts">
import { computed } from 'vue';
import { NSpace, NProgress, NCard } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';

const store = useSceneStore();
const {
    temperatureC,
    humidityRh,
    pm25Ug,
    temperatureComfort,
    humidityComfort,
    pm25Comfort,
} = storeToRefs(store);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const scaleToPercent = (value: number, min: number, max: number) => {
    if (max <= min) return 0;
    const t = clamp01((value - min) / (max - min));
    return Math.round(t * 100);
};

const tempIsComfort = computed(() => {
    const { min, max } = temperatureComfort.value;
    return temperatureC.value >= min && temperatureC.value <= max;
});

const humidityIsComfort = computed(() => {
    const { min, max } = humidityComfort.value;
    return humidityRh.value >= min && humidityRh.value <= max;
});

const pm25IsComfort = computed(() => pm25Ug.value <= pm25Comfort.value.max);

const tempPercent = computed(() => scaleToPercent(temperatureC.value, 10, 35));
const humidityPercent = computed(() => scaleToPercent(humidityRh.value, 0, 100));
const pm25Percent = computed(() => scaleToPercent(pm25Ug.value, 0, 200));
</script>

<template>
    <n-card class="env-indicators" :bordered="false" size="small">
        <n-space vertical size="large" align="center">
            <n-space vertical size="small" align="center">
                <n-progress type="circle" :percentage="tempPercent" :color="'rgb(24, 160, 88)'" ,
                    :rail-color="'rgba(24, 160, 88, 0.3)'" :height="76">
                    <div class="circle-text">
                        <div>温度</div>
                        <div class="circle-text__value">{{ temperatureC }}℃</div>
                        <div class="circle-text__status">{{ tempIsComfort ? '舒适' : '不舒适' }}</div>
                    </div>
                </n-progress>
            </n-space>

            <n-space vertical size="small" align="center">
                <n-progress type="circle" :percentage="humidityPercent" :color="'rgb(32, 128, 240)'"
                    :rail-color="'rgba(32, 128, 240, 0.3)'" :height="76">
                    <div class="circle-text">
                        <div>湿度</div>
                        <div class="circle-text__value">{{ humidityRh }}%</div>
                        <div class="circle-text__status">{{ humidityIsComfort ? '舒适' : '不舒适' }}</div>
                    </div>
                </n-progress>
            </n-space>

            <n-space vertical size="small" align="center">
                <n-progress type="circle" :percentage="pm25Percent" :color="'rgb(240, 160, 32)'"
                    :rail-color="'rgba(240, 160, 32, 0.3)'" :height="76">
                    <div class="circle-text">
                        <div>PM 2.5</div>
                        <div class="circle-text__value">{{ pm25Ug }}</div>
                        <div class="circle-text__status">{{ pm25IsComfort ? '舒适' : '不舒适' }}</div>
                    </div>
                </n-progress>
            </n-space>
        </n-space>
    </n-card>
</template>

<style scoped>
.env-indicators {
    position: absolute;
    left: 16px;
    top: 220px;
    width: 8%;
    pointer-events: auto;
    opacity: 0.18;
    transition: opacity 160ms ease;
}

.env-indicators:hover {
    opacity: 1;
}

.circle-text {
    text-align: center;
    line-height: 1.1;
}

.circle-text__value {
    font-size: 18px;
    font-weight: bold;
    margin-top: 4px;
}

.circle-text__status {
    margin-top: 2px;
    font-size: 14px;
    opacity: 0.8;
}
</style>
