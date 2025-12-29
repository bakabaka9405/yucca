import * as THREE from 'three/webgpu';

export class ThirdPersonCamera {
    camera: THREE.Camera;
    domElement: HTMLElement;
    target: THREE.Object3D | null = null;

    private theta: number = 0;
    private phi: number = Math.PI / 2;
    private radius: number = 3;
    private currentRadius: number = 3;
    private radiusVelocity: number = 0;
    private collider: THREE.Object3D | null = null;

    private targetTheta: number = 0;
    private targetPhi: number = Math.PI / 2;

    private minPolarAngle: number = 0.1;
    private maxPolarAngle: number = Math.PI - 0.1;

    private targetOffset: THREE.Vector3 = new THREE.Vector3(0, 1.5, 0);

    private isLocked: boolean = false;
    private sensitivity: number = 0.002;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('wheel', this.onMouseWheel);
    }

    setTarget(target: THREE.Object3D) {
        this.target = target;
        this.syncWithCamera();
    }

    setCollider(collider: THREE.Object3D) {
        this.collider = collider;
    }

    syncWithCamera() {
        if (!this.target) return;
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.target.position);
        this.radius = offset.length();
        this.currentRadius = this.radius;
        this.theta = Math.atan2(offset.x, offset.z);
        this.phi = Math.acos(THREE.MathUtils.clamp(offset.y / this.radius, -1, 1));

        this.targetTheta = this.theta;
        this.targetPhi = this.phi;
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isLocked) return;

        this.targetTheta -= event.movementX * this.sensitivity;
        this.targetPhi -= event.movementY * this.sensitivity;

        this.targetPhi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.targetPhi));
    }

    private onMouseWheel(event: WheelEvent) {
        if (!this.isLocked) return;
        this.radius += event.deltaY * 0.005;
        this.radius = Math.max(2, Math.min(20, this.radius));
    }

    update(deltaTime: number) {
        if (!this.target) return;

        const damping = 1 - Math.exp(-25 * deltaTime);

        let deltaTheta = this.targetTheta - this.theta;

        this.theta += deltaTheta * damping;
        this.phi += (this.targetPhi - this.phi) * damping;

        const targetPos = this.target.position.clone().add(this.targetOffset);

        let targetRadius = this.radius;
        if (this.collider) {
            const direction = new THREE.Vector3(0);
            direction.setFromSphericalCoords(1, this.phi, this.theta).normalize();

            const raycaster = new THREE.Raycaster(targetPos, direction);
            raycaster.far = this.radius;
            raycaster.firstHitOnly = true;
            const intersects = raycaster.intersectObject(this.collider, true);
            if (intersects.length > 0) {
                targetRadius = Math.max(0.2, intersects[0].distance - 0.2);
            }
        }

        const k = 100;
        const c = 20;
        const force = -k * (this.currentRadius - targetRadius) - c * this.radiusVelocity;
        this.radiusVelocity += force * deltaTime;
        this.currentRadius += this.radiusVelocity * deltaTime;

        this.camera.position.setFromSphericalCoords(this.currentRadius, this.phi, this.theta)
            .add(targetPos);
        this.camera.lookAt(targetPos);
    }

    setDomElement(domElement: HTMLElement) {
        this.domElement = domElement;
    }

    setLocked(locked: boolean) {
        this.isLocked = locked;
    }

    private onPointerLockChange() {
        this.isLocked = document.pointerLockElement === this.domElement;
    }

    dispose() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('wheel', this.onMouseWheel);
    }
}
