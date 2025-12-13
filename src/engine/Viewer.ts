import * as THREE from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import Stats from 'three/addons/libs/stats.module.js';
import { MovementController } from './controllers/MovementController';
import { FlyController } from './controllers/FlyController';
import { OrbitController } from './controllers/OrbitController';
import { ThirdPersonController } from './controllers/ThirdPersonController';
import { TopViewController } from './controllers/TopViewController';
import { Character } from './Character';
import { InputManager } from './InputManager';
import { PostProcessing, type GTAOParams } from './PostProcessing';
import { LightManager } from './LightManager';

export type MovementMode = 'fly' | 'orbit' | 'thirdPerson' | 'topView';
export class Viewer {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	stats: Stats;
	renderer: THREE.WebGPURenderer;
	gtaoPostProcessing: PostProcessing | null = null;
	gtaoEnabled: boolean = true;

	private controllers: { [key in MovementMode]: MovementController };
	private currentController: MovementController;
	movementMode: MovementMode = 'fly';

	private clock = new THREE.Clock();
	private environmentTexture: THREE.Texture | null = null;
	private mixers: THREE.AnimationMixer[] = [];
	private worldDirection = new THREE.Vector3();
	private tempTarget = new THREE.Vector3();
	private skyboxTexture: THREE.CubeTexture | null = null;

	public character: Character | null = null;
	public lightManager: LightManager | null = null;

	private updateListeners: Set<(delta: number) => void> = new Set();

	constructor() {
		// 场景
		this.scene = new THREE.Scene();
		// 相机
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
		this.camera.position.set(1, 1, 1);
		// 渲染器
		this.renderer = new THREE.WebGPURenderer({
			antialias: true,
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);
		document.body.appendChild(this.renderer.domElement);

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.controllers = {
			fly: new FlyController(this.camera, this.renderer.domElement),
			orbit: new OrbitController(this.camera, this.renderer.domElement),
			thirdPerson: new ThirdPersonController(this.camera, this.renderer.domElement, new THREE.Vector3()),
			topView: new TopViewController(this.camera, this.renderer.domElement)
		};

		this.currentController = this.controllers.fly;

		this.renderer.setAnimationLoop(this.animate);

		// 画布尺寸随着窗口变化
		window.addEventListener('resize', () => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		});
	}

	addMixer(mixer: THREE.AnimationMixer) {
		this.mixers.push(mixer);
	}

	setCharacter(character: Character) {
		this.character = character;
		if (character.mesh) {
			this.scene.add(character.mesh);
			(this.controllers.thirdPerson as ThirdPersonController).setCharacter(character);
		}
	}

	removeMixer(mixer: THREE.AnimationMixer) {
		const index = this.mixers.indexOf(mixer);
		if (index !== -1) {
			this.mixers.splice(index, 1);
		}
	}

	async init() {
		await this.renderer.init();
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
		this.environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
		this.scene.environment = this.environmentTexture;

		// Post-processing setup
		this.gtaoPostProcessing = new PostProcessing(this.renderer, this.scene, this.camera);

		this.currentController.enter();
	}

	updateGTAO(params: GTAOParams) {
		this.gtaoEnabled = params.enabled;
		if (this.gtaoPostProcessing) {
			this.gtaoPostProcessing.update(params);
		}
	}

	lockPointer() {
		if (this.movementMode === 'fly') {
			(this.currentController as FlyController).setLocked(true);
		} else if (this.movementMode === 'thirdPerson') {
			(this.currentController as ThirdPersonController).setLocked(true);
		}
	}

	unlockPointer() {
		if (this.movementMode === 'fly') {
			(this.currentController as FlyController).setLocked(false);
		} else if (this.movementMode === 'thirdPerson') {
			(this.currentController as ThirdPersonController).setLocked(false);
		}
	}

	setMovementMode(mode: MovementMode) {
		if (this.movementMode === mode) return;

		this.currentController.leave();
		this.movementMode = mode;
		this.currentController = this.controllers[mode];
		this.currentController.enter();
	}

	setCameraPosition(position: THREE.Vector3) {
		this.camera.position.copy(position);
	}

	setCameraDirection(direction: THREE.Vector3) {
		if (this.movementMode === 'orbit') return;
		if (direction.lengthSq() === 0) return;
		const normalized = direction.clone().normalize();
		this.tempTarget.copy(this.camera.position).add(normalized);
		this.camera.lookAt(this.tempTarget);
	}

	getCameraDirection() {
		this.camera.getWorldDirection(this.worldDirection);
		return this.worldDirection.clone();
	}

	onUpdate(callback: (delta: number) => void) {
		this.updateListeners.add(callback);
		return () => this.updateListeners.delete(callback);
	}

	private animate = () => {
		const delta = this.clock.getDelta();

		for (const mixer of this.mixers) {
			mixer.update(delta);
		}

		if (this.character) {
			this.character.update(delta);
		}

		this.currentController.update(delta);

		this.updateListeners.forEach(listener => listener(delta));

		this.stats.update();
		
		if (this.gtaoPostProcessing && this.gtaoEnabled) {
			this.gtaoPostProcessing.render();
		} else {
			this.renderer.render(this.scene, this.camera);
		}

		InputManager.getInstance().update();
	};

	dispose() {
		this.renderer.setAnimationLoop(null);

		Object.values(this.controllers).forEach(c => c.dispose());

		this.renderer.dispose();

		if (this.renderer.domElement.parentElement) {
			this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
		}
		if (this.stats.dom.parentElement) {
			this.stats.dom.parentElement.removeChild(this.stats.dom);
		}
	}

	setEnvironmentEnabled(enabled: boolean) {
		this.scene.environment = enabled ? this.environmentTexture : null;
	}

	setEnvironmentIntensity(intensity: number) {
		this.scene.environmentIntensity = intensity;
	}

	setEnvironmentCollider(collider: THREE.Object3D) {
		(this.controllers.thirdPerson as ThirdPersonController).setCollider(collider as THREE.Mesh);
	}

	setSkybox(texture: THREE.CubeTexture) {
		this.skyboxTexture = texture;
		this.scene.background = texture;
	}

	setSkyboxEnabled(enabled: boolean) {
		this.scene.background = enabled ? this.skyboxTexture : null;
	}
}

const viewer = new Viewer();
export default viewer;