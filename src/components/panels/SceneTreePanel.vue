<script setup lang="ts">
import { ref, watch } from 'vue';
import { NSpace, NText, NSlider, NTree, type TreeOption } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../../stores/sceneStore';
import type * as THREE from 'three/webgpu';

export interface SceneTreeNode extends TreeOption {
    key: string;
    label: string;
    object3D: THREE.Object3D;
    children?: SceneTreeNode[];
}

const store = useSceneStore();
const { modelRoot, movementMode } = storeToRefs(store);

const sceneTreeData = ref<SceneTreeNode[]>([]);
const checkedKeys = ref<string[]>([]);
const treeMaxDepth = ref(4);

const buildSceneTree = (object: THREE.Object3D, parentKey = '', currentDepth = 1): SceneTreeNode => {
    const key = parentKey ? `${parentKey}-${object.id}` : `${object.id}`;
    const node: SceneTreeNode = {
        key,
        label: object.name || `${object.type} #${object.id}`,
        object3D: object,
    };

    if (object.children.length > 0 && currentDepth < treeMaxDepth.value) {
        node.children = object.children.map(child => buildSceneTree(child, key, currentDepth + 1));
    }

    return node;
};

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

const rebuildSceneTree = () => {
    if (modelRoot.value) {
        const treeNode = buildSceneTree(modelRoot.value);
        sceneTreeData.value = [treeNode];
        checkedKeys.value = collectAllKeys(sceneTreeData.value);
    }
};

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

function visitNode(path: string[]): SceneTreeNode | null {
    let cur = sceneTreeData.value;
    for (const name of path) {
        const next = cur.find(node => node.object3D.name === name);
        if (!next) return null;
        if (name === path[path.length - 1]) {
            return next;
        }
        cur = next.children || [];
    }
    return null;
}

watch(modelRoot, (newRoot) => {
    if (newRoot) {
        rebuildSceneTree();
    }
}, { immediate: true });

watch(treeMaxDepth, () => {
    rebuildSceneTree();
});

watch(movementMode, (mode) => {
    const isTop = mode === 'topView';
    const node = visitNode(['Scene', 'Scene_Collection', 'Ceiling']);
    if (node) {
        node.object3D.visible = !isTop;
        if (!isTop) {
            if (!checkedKeys.value.includes(node.key)) {
                checkedKeys.value.push(node.key);
            }
        } else {
            checkedKeys.value = checkedKeys.value.filter(k => k !== node.key);
        }
    }
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
