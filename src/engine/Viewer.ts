import * as THREE from 'three/webgpu';
import Stats from 'three/addons/libs/stats.module.js';

export class Viewer {
	camera: THREE.PerspectiveCamera;
	stats: Stats;
	renderer: THREE.WebGPURenderer;
	private _onRendererChange: Set<(renderer: THREE.WebGPURenderer) => void> = new Set();

	constructor() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
		this.camera.position.set(1, 1, 1);

		this.renderer = this._createRenderer(true);
		document.body.appendChild(this.renderer.domElement);

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		window.addEventListener('resize', () => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		});
	}

	private _createRenderer(antialias: boolean): THREE.WebGPURenderer {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const renderer = new THREE.WebGPURenderer({
			antialias: antialias,
		});
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.0;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
		return renderer;
	}

	async recreateRenderer(antialias: boolean) {
		const oldRenderer = this.renderer;
		const newRenderer = this._createRenderer(antialias);
		
		await newRenderer.init();

		// Replace DOM element
		if (oldRenderer.domElement.parentElement) {
			oldRenderer.domElement.parentElement.replaceChild(newRenderer.domElement, oldRenderer.domElement);
		} else {
			document.body.appendChild(newRenderer.domElement);
		}

		// Dispose old renderer
		oldRenderer.dispose();

		this.renderer = newRenderer;

		// Notify listeners
		this._onRendererChange.forEach(callback => callback(newRenderer));
	}

	onRendererChange(callback: (renderer: THREE.WebGPURenderer) => void) {
		this._onRendererChange.add(callback);
		return () => this._onRendererChange.delete(callback);
	}

	async init() {
		await this.renderer.init();
	}

	dispose() {
		this.renderer.dispose();
		this.renderer.domElement.parentElement?.removeChild(this.renderer.domElement);
		this.stats.dom.parentElement?.removeChild(this.stats.dom);
	}

	setStatsVisible(visible: boolean) {
		this.stats.dom.style.display = visible ? 'block' : 'none';
	}
}

const viewer = new Viewer();
export default viewer;