<script setup lang="ts">
import { ref, watch } from 'vue';
import { NSpace, NText, NSlider, NTree, type TreeOption } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import type * as THREE from 'three';

// 模型层级树节点接口
export interface SceneTreeNode extends TreeOption {
    key: string;
    label: string;
    object3D: THREE.Object3D;
    children?: SceneTreeNode[];
}

const store = useSceneStore();
const { modelRoot, modelLabelPrefix } = storeToRefs(store);

const sceneTreeData = ref<SceneTreeNode[]>([]);
const checkedKeys = ref<string[]>([]);
const treeMaxDepth = ref(4);

const removePrefix = (s: string, prefix: string) => {
    if (prefix && s.startsWith(prefix)) {
        return s.slice(prefix.length);
    }
    return s;
};

const buildSceneTree = (object: THREE.Object3D, parentKey = '', currentDepth = 1): SceneTreeNode => {
    const key = parentKey ? `${parentKey}-${object.id}` : `${object.id}`;
    const node: SceneTreeNode = {
        key,
        label: removePrefix(object.name, modelLabelPrefix.value || '') || `${object.type} #${object.id}`,
        object3D: object,
    };

    if (object.children.length > 0 && currentDepth < treeMaxDepth.value) {
        node.children = object.children.map(child => buildSceneTree(child, key, currentDepth + 1));
    }

    return node;
};

// 收集所有节点的 key
const collectAllKeys = (nodes: SceneTreeNode[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodeList: SceneTreeNode[]) => {
        for (const node of nodeList) {
            keys.push(node.key);
            if (node.children) {
                traverse(node.children);
            }
        }
    };
    traverse(nodes);
    return keys;
};

// 重新构建场景树
const rebuildSceneTree = () => {
    if (modelRoot.value) {
        const treeNode = buildSceneTree(modelRoot.value);
        sceneTreeData.value = [treeNode];
        checkedKeys.value = collectAllKeys(sceneTreeData.value);
    }
};

// 处理勾选状态变化
const handleCheckedKeysUpdate = (
    keys: string[],
    _options: Array<TreeOption | null>,
    meta: { node: TreeOption | null, action: 'check' | 'uncheck' }
) => {
    const node = meta.node as SceneTreeNode | null;
    if (node) {
        node.object3D.visible = meta.action === 'check';
    }
    checkedKeys.value = keys;
};

// 监听模型根节点变化
watch(modelRoot, (newRoot) => {
    if (newRoot) {
        rebuildSceneTree();
    }
}, { immediate: true });

// 监听树状图最大深度变化
watch(treeMaxDepth, () => {
    rebuildSceneTree();
});
</script>

<template>
    <n-text depth="3">勾选/取消勾选以显示/隐藏模型层级中的对象。</n-text>

    <!-- 最大深度设置 -->
    <n-space vertical size="small" style="margin-top: 12px; margin-bottom: 12px;">
        <n-space justify="space-between" style="width: 100%;">
            <n-text depth="2" style="font-size: 12px;">显示深度</n-text>
            <n-text>{{ treeMaxDepth }} 层</n-text>
        </n-space>
        <n-slider v-model:value="treeMaxDepth" :min="1" :max="10" :step="1" />
    </n-space>

    <div class="scene-tree-container">
        <n-tree :data="sceneTreeData" :checked-keys="checkedKeys" @update:checked-keys="handleCheckedKeysUpdate"
            checkable selectable block-line expand-on-click default-expand-all style="font-size: 12px" />
    </div>
</template>

<style scoped>
.scene-tree-container {
    margin-top: 12px;
}
</style>
