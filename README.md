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
- 多模式相机控制（飞行 / 轨道 / 第三人称 / 顶视图）
- 角色控制与物理碰撞检测（基于 three-mesh-bvh）
- 骨骼动画绑定
- 场景交互系统（开关门）
- 场景树面板与参数调节
- 基础光照模型（全局光照、太阳光、摄像机锥形光）
- 模型加载（支持 GLTF/GLB/FBX，KTX2 编码，Draco 压缩）
- 无限网格辅助显示

## 目录结构

```
public/           # 静态资源
├── basis/        # Basis 转码器
├── cubeMap/      # 天空盒贴图
├── draco/        # Draco 解码器
├── models/       # 3D 模型文件
src/
├── components/   # Vue UI 组件
├── config/       # 配置文件
├── engine/       # 3D 引擎核心逻辑
│   ├── controllers/       # 相机与角色控制器
│   ├── Character.ts       # 角色控制逻辑
│   ├── ColliderManager.ts # 碰撞检测管理
│   ├── DoorManager.ts     # 交互物体管理
│   ├── InfiniteGrid.ts    # 无限网格
│   ├── LightManager.ts    # 灯光管理
│   ├── ModelLoader.ts     # 模型加载器
│   ├── Viewer.ts          # 场景核心类
│   └── ViewerInit.ts      # 场景初始化
└── stores/       # Pinia 状态管理
```

## 模型文件

3D 模型文件（`.gltf`、`.glb`）放在 `public/models` 目录下，开发时通过 `/models/模型名.glb` 或 `/models/模型名.gltf` 路径访问，支持加载压缩的模型。