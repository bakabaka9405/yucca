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

## 系统特色

目前已实现：

- 基础 3D 场景渲染
- 多模式相机控制（飞行 / 轨道 / 第三人称 / 顶视）
- 角色控制与碰撞检测（基于 `three-mesh-bvh`）
- 骨骼动画与模型绑定
- 模型加载与压缩支持（GLTF/GLB/FBX、KTX2、Draco）
- 灯光与后处理（全局光照、太阳光、后处理特效）
- 场景交互与 UI（开关门、场景树、参数面板、控制面板）
- 热力图与环境指标管理
- 模块化引擎结构

## 目录结构

```
public/           # 静态资源
├── basis/        # Basis 转码器
├── cubeMap/      # 天空盒贴图
├── draco/        # Draco 解码器
├── models/       # 3D 模型文件
src/
├── App.vue
├── index.ts
├── style.css
├── assets/        # 静态资源（图标、贴图等）
├── components/    # Vue UI 组件（ControlPanel / LoadingOverlay / Viewer 等）
├── composables/   # 组合式函数（如 useViewerSync）
├── config/        # 配置文件
├── engine/        # 3D 引擎核心逻辑
│   ├── controllers/          # 各类控制器（Fly / Orbit / ThirdPerson / TopView）
│   ├── Character.ts          # 角色控制器
│   ├── ColliderManager.ts    # 碰撞箱控制
│   ├── DoorManager.ts        # 门交互管理
│   ├── Engine.ts             # 主引擎模块
│   ├── EnvHeatmapManager.ts  # 环境热力图管理
│   ├── HeatmapManager.ts     # 足迹热力图管理
│   ├── InfiniteGrid.ts       # 地板
│   ├── InputManager.ts       # 输入管理
│   ├── LightManager.ts       # 光照管理
│   ├── ModelLoader.ts        # 模型管理
│   ├── PostProcessing.ts     # 后处理管理
│   └── Viewer.ts             # 渲染器管理
└── stores/         # Pinia 状态管理
```

## 模型文件

3D 模型文件（`.gltf`、`.glb`）放在 `public/models` 目录下，开发时通过 `/models/模型名.glb` 或 `/models/模型名.gltf` 路径访问，支持加载压缩的模型。