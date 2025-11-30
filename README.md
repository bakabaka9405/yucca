# Yucca

基于 Vue 3 + Three.js 的好房子。项目使用 Bun 作为包管理器，使用 Farm 作为构建工具。

## 环境要求

- Node.js >= 18
- bun

## 安装依赖

```bash
bun i
```

## 开发

```bash
bun run dev
```

## 构建

```bash
bun run build
```

## 开发现状

目前已实现：

- 基础 3D 场景渲染
- 双模式相机控制（飞行模式 / 轨道模式）
- 场景树面板
- 基础光照模型（全局光照、太阳光、摄像机锥形光）
- 场景参数调节面板
- 模型加载（支持 GLTF/GLB，Draco 压缩）

## 目录结构

```
public/           # 静态资源
├── cubeMap/      # 天空盒贴图
├── draco/        # Draco 解码器
├── textures/     # 纹理贴图
├── models/       # 3D 模型文件放这里
src/
├── viewer.ts     # Three.js 场景核心类
├── components/   # Vue 组件
└── stores/       # Pinia 状态管理
```

## 模型文件

3D 模型文件（`.gltf`、`.glb`）放在 `public/models` 目录下，开发时通过 `/models/模型名.glb` 或 `/models/模型名.gltf` 路径访问，支持加载压缩的模型。