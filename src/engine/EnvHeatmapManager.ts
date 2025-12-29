import * as THREE from 'three/webgpu';
import {
    Fn,
    dot,
    float,
    instanceIndex,
    mix,
    pow,
    rand,
    smoothstep,
    texture,
    textureStore,
    uvec2,
    uniform,
    uv,
    vec2,
    vec3,
    vec4,
} from 'three/tsl';

export type EnvHeatmapLayer = 'temperature' | 'humidity' | 'pm25';

type LayerConfig = {
    layer: EnvHeatmapLayer;
    baseColor: THREE.ConstNode<THREE.Vector3>;
    noiseScale: number;
    timeSpeed: number;
    curvePow: number;
};

export class EnvHeatmapManager {
    private renderer: THREE.WebGPURenderer;

    private boundsMinUniform = uniform(vec2(-50, -50));
    private boundsMaxUniform = uniform(vec2(50, 50));
    private timeUniform = uniform(float(0));

    private params = {
        resolution: 512,
        flipV: true,
        displayGamma: 1.25,
        opacity: 0.55,
        y: 0.45,
    };

    private textures: Record<EnvHeatmapLayer, THREE.StorageTexture>;
    private computeNodes: Record<EnvHeatmapLayer, any>;
    private displayMeshes: Partial<Record<EnvHeatmapLayer, THREE.Mesh>> = {};

    private activeLayer: EnvHeatmapLayer | null = null;

    private layerConfigs: Record<EnvHeatmapLayer, LayerConfig> = {
        temperature: {
            layer: 'temperature',
            baseColor: vec3(0.1, 0.6, 0.35),
            noiseScale: 0.08,
            timeSpeed: 0.15,
            curvePow: 1.2,
        },
        humidity: {
            layer: 'humidity',
            baseColor: vec3(0.0, 0.2, 1.0),
            noiseScale: 0.1,
            timeSpeed: 0.22,
            curvePow: 1.15,
        },
        pm25: {
            layer: 'pm25',
            baseColor: vec3(1.0, 1.0, 0.0),
            noiseScale: 0.14,
            timeSpeed: 0.35,
            curvePow: 2.6,
        },
    };

    constructor(renderer: THREE.WebGPURenderer) {
        this.renderer = renderer;

        const createTexture = () => {
            const tex = new THREE.StorageTexture(this.params.resolution, this.params.resolution);
            tex.type = THREE.FloatType;
            tex.format = THREE.RedFormat; // R32F
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            return tex;
        };

        this.textures = {
            temperature: createTexture(),
            humidity: createTexture(),
            pm25: createTexture(),
        };

        this.computeNodes = {
            temperature: this.createComputeNode(this.textures.temperature, this.layerConfigs.temperature),
            humidity: this.createComputeNode(this.textures.humidity, this.layerConfigs.humidity),
            pm25: this.createComputeNode(this.textures.pm25, this.layerConfigs.pm25),
        };
    }

    createDisplayMeshes(scene: THREE.Scene) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        geometry.rotateX(-Math.PI / 2);

        (Object.keys(this.layerConfigs) as EnvHeatmapLayer[]).forEach((layer) => {
            const config = this.layerConfigs[layer];
            const tex = this.textures[layer];

            const uvNode = this.params.flipV ? uv().flipY() : uv();
            const value = texture(tex).sample(uvNode).r;

            const valueVis = pow(value.max(0.0), float(this.params.displayGamma));

            const base = config.baseColor;
            const colorNode = mix(base.mul(0.25), base, valueVis);
            const alphaNode = smoothstep(0.12, 0.85, valueVis).mul(this.params.opacity);

            const material = new THREE.MeshBasicNodeMaterial();
            material.colorNode = colorNode;
            material.opacityNode = alphaNode;
            material.transparent = true;
            material.side = THREE.DoubleSide;
            material.depthWrite = false;
            material.polygonOffset = true;
            material.polygonOffsetFactor = -2;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = this.params.y;
            mesh.visible = false;

            this.displayMeshes[layer] = mesh;
            scene.add(mesh);
        });

        this.updateDisplayMeshTransform();
    }

    update(deltaSeconds: number) {
        this.timeUniform.value = this.timeUniform.value + deltaSeconds;

        if (!this.activeLayer) return;

        const mesh = this.displayMeshes[this.activeLayer];
        if (!mesh || !mesh.visible) return;

        this.renderer.compute(this.computeNodes[this.activeLayer]);
    }

    setActiveLayer(layer: EnvHeatmapLayer | null) {
        this.activeLayer = layer;

        (Object.keys(this.layerConfigs) as EnvHeatmapLayer[]).forEach((key) => {
            const mesh = this.displayMeshes[key];
            if (mesh) mesh.visible = layer === key;
        });
    }

    setRenderer(renderer: THREE.WebGPURenderer) {
        this.renderer = renderer;
    }

    setXZBoundsFromBox3(box: THREE.Box3) {
        this.boundsMinUniform.value.set(box.min.x, box.min.z);
        this.boundsMaxUniform.value.set(box.max.x, box.max.z);
        this.updateDisplayMeshTransform();
    }

    private updateDisplayMeshTransform() {
        const meshes = Object.values(this.displayMeshes).filter(Boolean) as THREE.Mesh[];
        if (meshes.length === 0) return;

        const min = this.boundsMinUniform.value;
        const max = this.boundsMaxUniform.value;

        const width = max.x - min.x;
        const depth = max.y - min.y;
        const centerX = (min.x + max.x) * 0.5;
        const centerZ = (min.y + max.y) * 0.5;

        meshes.forEach((mesh) => {
            mesh.scale.set(width, 1, depth);
            mesh.position.x = centerX;
            mesh.position.z = centerZ;
        });
    }

    private createComputeNode(writeTex: THREE.StorageTexture, config: LayerConfig) {
        const perlin3D = Fn(([p]: any[]) => {
            const i = p.floor().toVar();
            const f = p.fract().toVar();

            const fade = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));

            const grad3 = (v: any) => {
                const key = vec2(v.x.add(v.z.mul(37.0)), v.y.add(v.z.mul(17.0)));
                const r1 = rand(key);
                const r2 = rand(key.add(vec2(19.19, 7.17)));
                const r3 = rand(key.add(vec2(3.11, 11.73)));
                return vec3(r1, r2, r3).mul(2.0).sub(1.0).normalize();
            };

            const g000 = grad3(i);
            const g100 = grad3(i.add(vec3(1.0, 0.0, 0.0)));
            const g010 = grad3(i.add(vec3(0.0, 1.0, 0.0)));
            const g110 = grad3(i.add(vec3(1.0, 1.0, 0.0)));
            const g001 = grad3(i.add(vec3(0.0, 0.0, 1.0)));
            const g101 = grad3(i.add(vec3(1.0, 0.0, 1.0)));
            const g011 = grad3(i.add(vec3(0.0, 1.0, 1.0)));
            const g111 = grad3(i.add(vec3(1.0, 1.0, 1.0)));

            const n000 = dot(g000, f);
            const n100 = dot(g100, f.sub(vec3(1.0, 0.0, 0.0)));
            const n010 = dot(g010, f.sub(vec3(0.0, 1.0, 0.0)));
            const n110 = dot(g110, f.sub(vec3(1.0, 1.0, 0.0)));
            const n001 = dot(g001, f.sub(vec3(0.0, 0.0, 1.0)));
            const n101 = dot(g101, f.sub(vec3(1.0, 0.0, 1.0)));
            const n011 = dot(g011, f.sub(vec3(0.0, 1.0, 1.0)));
            const n111 = dot(g111, f.sub(vec3(1.0, 1.0, 1.0)));

            const nx00 = mix(n000, n100, fade.x);
            const nx10 = mix(n010, n110, fade.x);
            const nx01 = mix(n001, n101, fade.x);
            const nx11 = mix(n011, n111, fade.x);

            const nxy0 = mix(nx00, nx10, fade.y);
            const nxy1 = mix(nx01, nx11, fade.y);

            return mix(nxy0, nxy1, fade.z).mul(0.5).add(0.5);
        });

        const fbm = Fn(([p]: any[]) => {
            const n1 = perlin3D(p);
            const n2 = perlin3D(p.mul(2.0));
            const n3 = perlin3D(p.mul(4.0));
            const n4 = perlin3D(p.mul(8.0));

            const sum = n1.mul(0.5).add(n2.mul(0.25)).add(n3.mul(0.125)).add(n4.mul(0.0625));
            return sum.div(0.9375);
        });

        return Fn(() => {
            const width = float(this.params.resolution);
            const height = float(this.params.resolution);

            const posX = instanceIndex.mod(this.params.resolution);
            const posY = instanceIndex.div(this.params.resolution);
            const texel = uvec2(posX, posY);

            const u = posX.toVar().toFloat().add(0.5).div(width);
            const v = posY.toVar().toFloat().add(0.5).div(height);

            const worldX = mix(this.boundsMinUniform.x, this.boundsMaxUniform.x, u);
            const worldZ = mix(this.boundsMinUniform.y, this.boundsMaxUniform.y, v);

            const p = vec3(
                worldX.mul(float(config.noiseScale)),
                worldZ.mul(float(config.noiseScale)),
                this.timeUniform.mul(float(config.timeSpeed))
            );

            let value = fbm(p);
            value = pow(value.add(0.2).max(0.0).min(1.0), float(config.curvePow));

            textureStore(writeTex, texel, vec4(value, 0, 0, 0));
        })().compute(this.params.resolution * this.params.resolution);
    }
}
