import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js'

export type MovementMode = 'fly' | 'orbit';
export class Viewer {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	stats: Stats;
	renderer: THREE.WebGLRenderer;
	controls: PointerLockControls;
	orbitControls: OrbitControls;
	movementMode: MovementMode = 'fly';
	private moveForward = false;
	private moveBackward = false;
	private moveLeft = false;
	private moveRight = false;
	private moveUp = false;
	private moveDown = false;
	private velocity = new THREE.Vector3();
	private direction = new THREE.Vector3();
	private tempForward = new THREE.Vector3();
	private tempRight = new THREE.Vector3();
	private moveVector = new THREE.Vector3();
	private tempTarget = new THREE.Vector3();
	private worldDirection = new THREE.Vector3();
	private prevTime = performance.now();
	private moveSpeed = 50;
	private modelRoot: THREE.Object3D | null = null;
	private readonly minMoveSpeed = 10;
	private readonly maxMoveSpeed = 2000;
	private currentModelScale = 1;

	constructor() {
		// 场景
		this.scene = new THREE.Scene();
		// 相机
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
		this.camera.position.set(1, 0, 0);
		// 渲染器
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			logarithmicDepthBuffer: true,
		});
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);
		document.body.appendChild(this.renderer.domElement);
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		// 控制器
		this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
		this.scene.add(this.controls.object);
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.enabled = false;
		this.orbitControls.enableDamping = true;
		this.orbitControls.dampingFactor = 0.08;
		this.orbitControls.rotateSpeed = 0.35;
		this.orbitControls.target.set(0, 0, 0);
		this.initKeyboardEvents();
		this.renderer.domElement.addEventListener('click', () => {
			if (this.movementMode === 'fly' && !this.controls.isLocked) {
				this.lockPointer();
			}
		});
		this.renderer.setAnimationLoop(this.animate);

		// 画布尺寸随着窗口变化
		window.addEventListener('resize', () => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		});
	}

	lockPointer() {
		if (this.movementMode !== 'fly') return;
		this.controls.lock();
	}

	unlockPointer() {
		if (this.controls.isLocked) {
			this.controls.unlock();
		}
	}

	setMovementMode(mode: MovementMode) {
		this.movementMode = mode;
		if (mode === 'fly') {
			this.orbitControls.enabled = false;
		} else {
			this.orbitControls.enabled = true;
			this.unlockPointer();
		}
	}

	getMovementMode() {
		return this.movementMode;
	}

	setMoveSpeed(speed: number) {
		const clamped = THREE.MathUtils.clamp(speed, this.minMoveSpeed, this.maxMoveSpeed);
		this.moveSpeed = clamped;
	}

	getMoveSpeed() {
		return this.moveSpeed;
	}

	setCameraPosition(position: THREE.Vector3) {
		this.camera.position.copy(position);
		const direction = this.getCameraDirection();
		this.tempTarget.copy(position).add(direction);
		this.camera.lookAt(this.tempTarget);
		this.orbitControls.target.copy(this.tempTarget);
		this.orbitControls.update();
	}

	setCameraDirection(direction: THREE.Vector3) {
		if (direction.lengthSq() === 0) return;
		const normalized = direction.clone().normalize();
		this.tempTarget.copy(this.camera.position).add(normalized);
		this.camera.lookAt(this.tempTarget);
		this.orbitControls.target.copy(this.tempTarget);
		this.orbitControls.update();
	}

	getCameraDirection() {
		this.camera.getWorldDirection(this.worldDirection);
		return this.worldDirection.clone();
	}

	registerModel(object: THREE.Object3D) {
		this.modelRoot = object;
		this.setModelScale(this.currentModelScale);
	}

	setModelScale(scale: number) {
		scale = Math.max(0.01, scale);
		this.currentModelScale = scale;
		if (this.modelRoot) {
			this.modelRoot.scale.setScalar(scale);
		}
	}

	getModelScale() {
		return this.currentModelScale;
	}

	private initKeyboardEvents() {
		const onKeyDown = (event: KeyboardEvent) => {
			switch (event.code) {
				case 'KeyW':
				case 'ArrowUp':
					this.moveForward = true;
					break;
				case 'KeyS':
				case 'ArrowDown':
					this.moveBackward = true;
					break;
				case 'KeyA':
				case 'ArrowLeft':
					this.moveLeft = true;
					break;
				case 'KeyD':
				case 'ArrowRight':
					this.moveRight = true;
					break;
				case 'Space':
					this.moveUp = true;
					break;
				case 'ShiftLeft':
				case 'ShiftRight':
					this.moveDown = true;
					break;
			}
		};

		const onKeyUp = (event: KeyboardEvent) => {
			switch (event.code) {
				case 'KeyW':
				case 'ArrowUp':
					this.moveForward = false;
					break;
				case 'KeyS':
				case 'ArrowDown':
					this.moveBackward = false;
					break;
				case 'KeyA':
				case 'ArrowLeft':
					this.moveLeft = false;
					break;
				case 'KeyD':
				case 'ArrowRight':
					this.moveRight = false;
					break;
				case 'Space':
					this.moveUp = false;
					break;
				case 'ShiftLeft':
				case 'ShiftRight':
					this.moveDown = false;
					break;
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
	}

	private animate = () => {
		const time = performance.now();
		const delta = (time - this.prevTime) / 1000;

		if (this.movementMode === 'fly') {
			if (this.controls.isLocked) {
				const damping = Math.min(4.0 * delta, 1);
				this.velocity.multiplyScalar(1 - damping);

				this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
				this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
				this.direction.y = Number(this.moveUp) - Number(this.moveDown);

				if (this.direction.lengthSq() > 0) {
					this.direction.normalize();

					this.tempForward.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
					this.tempRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize();

					this.moveVector.copy(this.tempForward).multiplyScalar(this.direction.z);
					this.moveVector.addScaledVector(this.tempRight, this.direction.x);
					// 垂直方向使用世界坐标系的 Y 轴
					this.moveVector.y += this.direction.y;
					this.moveVector.normalize();

					this.velocity.addScaledVector(this.moveVector, this.moveSpeed * delta);
				}

				this.camera.position.addScaledVector(this.velocity, delta);
			}
		} else {
			if (this.orbitControls.enabled) {
				this.orbitControls.update();
			}
		}

		this.stats.update();

		this.renderer.render(this.scene, this.camera);
		this.prevTime = time;
	};
}

const viewer = new Viewer();
export default viewer;