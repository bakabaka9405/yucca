import * as THREE from 'three/webgpu';
import { texture, vec2, vec3, vec4, mix, smoothstep, Fn, uniform, instanceIndex, textureStore, uvec2, float, uv, pow } from 'three/tsl';

export class HeatmapManager {
    private displayMesh: THREE.Mesh | null = null;
    private renderer: THREE.WebGPURenderer;

    // Ping-Pong Textures
    private storageTexture1: THREE.StorageTexture;
    private storageTexture2: THREE.StorageTexture;

    private computeNode1: any; // Read T1 -> Write T2
    private computeNode2: any; // Read T2 -> Write T1

    private characterPosUniform: any;
    private boundsMinUniform: any;
    private boundsMaxUniform: any;
    private pingPong = false; // false: T1 is source, T2 is dest. true: T2 is source, T1 is dest.
    private showTexture2Uniform: any; // 0: Show T1, 1: Show T2

    private params = {
        size: 100, // 覆盖范围 100x100
        resolution: 1024,
        brushRadius: 1.5,
        intensity: 0.05, // 增加一点强度，因为是累加
        decay: 0.0001, // 每帧轻微衰减，避免长时间累积导致大面积饱和发红

        // Display tuning
        flipV: true, // StorageTexture/UV 原点差异时可用于修正 Z 方向翻转
        displayGamma: 2.2, // >1 压缩高值，减少“满屏红”
        redBias: 0.75, // 红色起始位置（0~1），越大越不容易变红
    };

    constructor(renderer: THREE.WebGPURenderer) {
        this.renderer = renderer;

        // Create Storage Textures
        const createTexture = () => {
            const tex = new THREE.StorageTexture(this.params.resolution, this.params.resolution);
            tex.type = THREE.FloatType;
            tex.format = THREE.RedFormat; // R32F
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            return tex;
        };

        this.storageTexture1 = createTexture();
        this.storageTexture2 = createTexture();

        // Uniforms
        this.characterPosUniform = uniform(vec3(0));
        this.boundsMinUniform = uniform(vec2(-this.params.size / 2, -this.params.size / 2));
        this.boundsMaxUniform = uniform(vec2(this.params.size / 2, this.params.size / 2));

        // Compute Shader Generator
        const createComputeNode = (readTex: THREE.StorageTexture, writeTex: THREE.StorageTexture) => {
            return Fn(() => {
                const width = float(this.params.resolution);
                const height = float(this.params.resolution);

                const posX = instanceIndex.mod(this.params.resolution);
                const posY = instanceIndex.div(this.params.resolution);
                const uv = uvec2(posX, posY);

                // Read current value (R channel) from source
                const currentVal = texture(readTex).load(uv).r;

                // Calculate world position of this pixel within bounds (XZ)
                // Use pixel center sampling to reduce aliasing.
                const u = posX.toVar().toFloat().add(0.5).div(width);
                const v = posY.toVar().toFloat().add(0.5).div(height);
                const worldX = mix(this.boundsMinUniform.x, this.boundsMaxUniform.x, u);
                const worldZ = mix(this.boundsMinUniform.y, this.boundsMaxUniform.y, v);

                // Distance to character
                const dist = vec2(worldX, worldZ).distance(vec2(this.characterPosUniform.x, this.characterPosUniform.z));

                // Gentle decay to avoid saturating large areas over time
                const decay = float(this.params.decay);
                const newVal = currentVal.mul(float(1.0).sub(decay)).toVar();

                // Smooth kernel (C1 continuous) instead of hard threshold
                // w = clamp(1 - dist/r, 0..1)
                // falloff = smoothstep(0..1) on w: w^2 * (3 - 2w)
                // This removes the blocky edge and produces a softer trail.
                const t = dist.div(this.params.brushRadius);
                const w = float(1.0).sub(t).max(0.0);
                const falloff = w.mul(w).mul(float(3.0).sub(w.mul(2.0)));
                newVal.addAssign(falloff.mul(this.params.intensity));

                // Clamp to 1.0
                const clampedVal = newVal.min(1.0);

                // Write back to destination
                textureStore(writeTex, uv, vec4(clampedVal, 0, 0, 0));
            })().compute(this.params.resolution * this.params.resolution);
        };

        this.computeNode1 = createComputeNode(this.storageTexture1, this.storageTexture2);
        this.computeNode2 = createComputeNode(this.storageTexture2, this.storageTexture1);
    }

    createDisplayMesh(scene: THREE.Scene) {
        // Use unit plane, then scale/position to match bounds.
        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        // TSL Shader for Display
        this.showTexture2Uniform = uniform(0);

        const uvNode = this.params.flipV ? uv().flipY() : uv();

        const val1 = texture(this.storageTexture1).sample(uvNode).r;
        const val2 = texture(this.storageTexture2).sample(uvNode).r;

        // Select texture based on uniform
        const value = mix(val1, val2, this.showTexture2Uniform);

        // Compress highlights so red doesn't dominate
        const gamma = float(this.params.displayGamma);
        const valueVis = pow(value.max(0.0), gamma);

        // Bias red transition later in the range
        const redBias = float(this.params.redBias);
        const redWindow = float(0.05);
        const splitT = smoothstep(redBias.sub(redWindow), redBias.add(redWindow), valueVis);

        // 颜色定义
        const blue = vec3(0.0, 0.0, 1.0);
        const green = vec3(0.0, 1.0, 0.0);
        const red = vec3(1.0, 0.0, 0.0);

        // Blue -> Green -> Red (soft transitions)
        const color1 = mix(blue, green, valueVis.mul(2.0).min(1.0));
        const color2 = mix(green, red, valueVis.mul(2.0).sub(1.0).max(0.0));

        const finalColor = mix(color1, color2, splitT);

        // 透明度：软阈值，避免硬边
        const alpha = smoothstep(0.02, 0.12, valueVis).mul(0.6);

        const material = new THREE.MeshBasicNodeMaterial();
        material.colorNode = finalColor;
        material.opacityNode = alpha;
        material.transparent = true;
        material.side = THREE.DoubleSide;
        material.depthWrite = false;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -1; // 确保在地面之上

        this.displayMesh = new THREE.Mesh(geometry, material);
        this.displayMesh.position.y = 0.5;
        this.updateDisplayMeshTransform();
        this.displayMesh.visible = false;

        scene.add(this.displayMesh);
    }

    update(position: THREE.Vector3) {
        // Update Uniform
        this.characterPosUniform.value.copy(position);

        // Ping-Pong Logic
        if (!this.pingPong) {
            // Read T1 -> Write T2
            this.renderer.compute(this.computeNode1);
            // Next frame show T2
            this.showTexture2Uniform.value = 1;
            this.pingPong = true;
        } else {
            // Read T2 -> Write T1
            this.renderer.compute(this.computeNode2);
            // Next frame show T1
            this.showTexture2Uniform.value = 0;
            this.pingPong = false;
        }
    }

    setVisible(visible: boolean) {
        if (this.displayMesh) {
            this.displayMesh.visible = visible;
        }
    }

    setRenderer(renderer: THREE.WebGPURenderer) {
        this.renderer = renderer;
    }

    /**
     * Limit heatmap recording/rendering to a world-space XZ rectangle.
     * Typical usage: pass the house model's Box3 after it is added to the scene.
     */
    setXZBoundsFromBox3(box: THREE.Box3) {
        const min = box.min;
        const max = box.max;
        this.boundsMinUniform.value.set(min.x, min.z);
        this.boundsMaxUniform.value.set(max.x, max.z);
        this.updateDisplayMeshTransform();
    }

    private updateDisplayMeshTransform() {
        if (!this.displayMesh) return;

        const min = this.boundsMinUniform.value;
        const max = this.boundsMaxUniform.value;

        const width = max.x - min.x;
        const depth = max.y - min.y;
        const centerX = (min.x + max.x) * 0.5;
        const centerZ = (min.y + max.y) * 0.5;

        this.displayMesh.scale.set(width, 1, depth);
        this.displayMesh.position.x = centerX;
        this.displayMesh.position.z = centerZ;
    }
}
