<script setup lang="ts">
import { computed } from 'vue';
import { NGrid, NGi, NSpace, NText, NInputNumber } from 'naive-ui';

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

const value = defineModel<Vector3>('value', { required: true });
const editing = defineModel<boolean>('editing');

const handleFocus = () => editing.value = true;
const handleBlur = () => editing.value = false;

const createProxy = (key: keyof Vector3) => computed({
    get: () => value.value[key],
    set: (val: number | null) => {
        if (val === null) return;
        value.value = { ...value.value, [key]: val };
    }
});

const x = createProxy('x');
const y = createProxy('y');
const z = createProxy('z');
</script>

<template>
    <n-grid :cols="3" :x-gap="8">
        <n-gi>
            <n-space vertical size="small">
                <n-text depth="3" style="font-size: 11px;">X</n-text>
                <n-input-number v-model:value="x" size="small" :show-button="false"
                    @focus="handleFocus" @blur="handleBlur" />
            </n-space>
        </n-gi>
        <n-gi>
            <n-space vertical size="small">
                <n-text depth="3" style="font-size: 11px;">Y</n-text>
                <n-input-number v-model:value="y" size="small" :show-button="false"
                    @focus="handleFocus" @blur="handleBlur" />
            </n-space>
        </n-gi>
        <n-gi>
            <n-space vertical size="small">
                <n-text depth="3" style="font-size: 11px;">Z</n-text>
                <n-input-number v-model:value="z" size="small" :show-button="false"
                    @focus="handleFocus" @blur="handleBlur" />
            </n-space>
        </n-gi>
    </n-grid>
</template>
