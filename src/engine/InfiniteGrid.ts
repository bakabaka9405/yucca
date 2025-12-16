import * as THREE from 'three/webgpu';
import { Fn, float, vec3, positionWorld, cameraPosition, smoothstep, mix } from 'three/tsl';

export class InfiniteGrid extends THREE.Mesh {
	constructor() {
		const geometry = new THREE.PlaneGeometry(1, 1);

		const material = new THREE.MeshStandardNodeMaterial({
			side: THREE.DoubleSide
		});

		const grid = Fn(() => {
			const worldPos = positionWorld.xz;

			const dist = positionWorld.distance(cameraPosition);
			const fade = smoothstep(1000, 200, dist);

			const size1 = float(10.0);
			const size2 = float(100.0);

			const uv1 = worldPos.div(size1);
			const grid1 = uv1.fract().sub(0.5).abs().mul(2.0);
			const line1 = smoothstep(0.95, 1.0, grid1.x).max(smoothstep(0.95, 1.0, grid1.y));

			const uv2 = worldPos.div(size2);
			const grid2 = uv2.fract().sub(0.5).abs().mul(2.0);
			const line2 = smoothstep(0.98, 1.0, grid2.x).max(smoothstep(0.98, 1.0, grid2.y));

			const gridColor = vec3(0.6);
			const baseColor = vec3(0.2);

			const alpha = mix(line1.mul(0.2), line2.mul(0.5), line2);

			return mix(baseColor, gridColor, alpha.mul(fade));
		});

		material.colorNode = grid();

		super(geometry, material);

		this.scale.set(4000, 4000, 1);
		this.rotation.x = -Math.PI / 2;
		this.frustumCulled = false;
		this.receiveShadow = true;
	}
}
