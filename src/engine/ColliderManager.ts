import * as THREE from 'three/webgpu';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import viewer from './Viewer';

export class ColliderManager {
	private collider: THREE.Mesh | null = null;

	constructor() { }

	public generateCollider(model: THREE.Object3D) {
		this.dispose();

		const geometries: THREE.BufferGeometry[] = [];

		model.traverse((child: THREE.Object3D) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				const geo = mesh.geometry.clone();
				let isDoorMesh = false;
				let p = mesh.parent;
				while (p) {
					if (p.name === 'Door') {
						isDoorMesh = true;
						break;
					}
					p = p.parent;
				}
				if (isDoorMesh || mesh.name.endsWith('Glass')) return;
				geo.applyMatrix4(mesh.matrixWorld);
				for (const key in geo.attributes) {
					if (key !== 'position') {
						geo.deleteAttribute(key);
					}
				}
				geometries.push(geo);
			}
		});

		if (geometries.length > 0) {
			const merged = BufferGeometryUtils.mergeGeometries(geometries);
			merged.computeBoundsTree();

			this.collider = new THREE.Mesh(
				merged,
				new THREE.MeshBasicMaterial({
					wireframe: true,
					color: 0xff0000
				}));
			this.collider.visible = false;
			this.collider.name = 'collider';

			viewer.scene.add(this.collider);
			viewer.setEnvironmentCollider(this.collider);
		}
	}

	public setVisibility(visible: boolean) {
		if (this.collider) {
			this.collider.visible = visible;
		}
	}

	public dispose() {
		if (this.collider) {
			viewer.scene.remove(this.collider);
			this.collider.geometry.dispose();
			if (Array.isArray(this.collider.material)) {
				this.collider.material.forEach(m => m.dispose());
			} else {
				this.collider.material.dispose();
			}
			this.collider = null;
		}
	}
}

export const colliderManager = new ColliderManager();
