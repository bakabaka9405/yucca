import * as THREE from 'three/webgpu';

export class InputManager {
    private static instance: InputManager;
    
    private keys: Set<string> = new Set();
    private keysDown: Set<string> = new Set();
    private mouseButtons: Set<number> = new Set();
    private mouseButtonsDown: Set<number> = new Set();
    
    // Mouse state
    public mousePosition: THREE.Vector2 = new THREE.Vector2();
    public mouseDelta: THREE.Vector2 = new THREE.Vector2();
    public mouseWheelDelta: number = 0;

    private constructor() {
        this.bindEvents();
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    private bindEvents() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!this.keys.has(event.code)) {
            this.keysDown.add(event.code);
        }
        this.keys.add(event.code);
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys.delete(event.code);
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.mouseButtons.has(event.button)) {
            this.mouseButtonsDown.add(event.button);
        }
        this.mouseButtons.add(event.button);
    }

    private onMouseUp(event: MouseEvent) {
        this.mouseButtons.delete(event.button);
    }

    private onMouseMove(event: MouseEvent) {
        this.mousePosition.set(event.clientX, event.clientY);
        this.mouseDelta.x += event.movementX;
        this.mouseDelta.y += event.movementY;
    }

    private onWheel(event: WheelEvent) {
        this.mouseWheelDelta += event.deltaY;
    }

    public isKeyPressed(code: string): boolean {
        return this.keys.has(code);
    }

    public isKeyDown(code: string): boolean {
        return this.keysDown.has(code);
    }

    public isMouseButtonPressed(button: number): boolean {
        return this.mouseButtons.has(button);
    }

    public isMouseButtonDown(button: number): boolean {
        return this.mouseButtonsDown.has(button);
    }

    public getMovementInput(): THREE.Vector3 {
        const x = (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight') ? 1 : 0) - (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft') ? 1 : 0);
        const z = (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp') ? 1 : 0) - (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown') ? 1 : 0);
        return new THREE.Vector3(x, 0, z);
    }

    public update() {
        this.keysDown.clear();
        this.mouseButtonsDown.clear();
        // Reset deltas at the end of the frame
        this.mouseDelta.set(0, 0);
        this.mouseWheelDelta = 0;
    }
}
