import * as THREE from 'three/webgpu';
import { useSceneStore } from '../stores/sceneStore';

export class Door {
    public object: THREE.Object3D;
    public isOpen: boolean = false;

    private mixer: THREE.AnimationMixer;
    private action: THREE.AnimationAction | null = null;

    public box: THREE.Box3;
    private worldPosition = new THREE.Vector3();

    constructor(object: THREE.Object3D, animations: THREE.AnimationClip[], mixer: THREE.AnimationMixer) {
        this.object = object;
        this.box = new THREE.Box3().setFromObject(object);

        this.mixer = mixer;
        const clipName = object.name + "Open"; // 模型约定的动画名称
        const clip = animations.find(a => a.name === clipName);

        if (clip) {
            this.action = this.mixer.clipAction(clip);
            this.action.loop = THREE.LoopOnce;
            this.action.clampWhenFinished = true;
        } else {
            console.warn(`Animation ${clipName} not found for door ${object.name}`);
        }
    }

    public get isAnimating(): boolean {
        return this.action ? this.action.isRunning() : false;
    }

    public interact() {
        if (!this.action) return;

        this.isOpen = !this.isOpen;

        this.action.paused = false;
        if (this.isOpen) {
            this.action.timeScale = 1;
            this.action.play();
        } else {
            this.action.timeScale = -1;
            this.action.play();
        }
    }

    public getDistance(point: THREE.Vector3): number {
        this.object.getWorldPosition(this.worldPosition);
        return this.worldPosition.distanceTo(point);
    }
}

export class DoorManager {
    public doors: Door[] = [];
    private interactionDistance = 2.0;
    private activeDoor: Door | null = null;

    constructor() { }

    public addDoor(object: THREE.Object3D, animations: THREE.AnimationClip[], mixer: THREE.AnimationMixer) {
        if (this.doors.find(d => d.object === object)) return;

        const door = new Door(object, animations, mixer);
        this.doors.push(door);
    }

    public update(playerPosition: THREE.Vector3) {
        let closest: Door | null = null;
        let minDst = Infinity;

        for (const door of this.doors) {
            const dst = door.getDistance(playerPosition);
            if (dst < this.interactionDistance && dst < minDst) {
                minDst = dst;
                closest = door;
            }
        }

        const store = useSceneStore();
        if (closest) {
            this.activeDoor = closest;
            store.showInteractionPrompt = true;
            store.interactionText = closest.isOpen ? '按 F 关门' : '按 F 开门';
        } else {
            this.activeDoor = null;
            store.showInteractionPrompt = false;
        }
    }

    public interact() {
        if (this.activeDoor) {
            this.activeDoor.interact();
        }
    }

    public checkCollision(playerPos: THREE.Vector3, radius: number, deltaPosition: THREE.Vector3) {
        for (const door of this.doors) {
            if (!door.isOpen && !door.isAnimating) {
                door.box.setFromObject(door.object);

                const playerBox = new THREE.Box3();
                const center = playerPos.clone().add(deltaPosition);
                playerBox.min.set(center.x - radius, center.y, center.z - radius);
                playerBox.max.set(center.x + radius, center.y + 2, center.z + radius);

                if (door.box.intersectsBox(playerBox)) {
                    const intersection = door.box.clone().intersect(playerBox);
                    const dx = intersection.max.x - intersection.min.x;
                    const dz = intersection.max.z - intersection.min.z;

                    if (dx < dz) {
                        if (center.x < door.box.min.x + (door.box.max.x - door.box.min.x) / 2) {
                            deltaPosition.x -= dx;
                        } else {
                            deltaPosition.x += dx;
                        }
                    } else {
                        if (center.z < door.box.min.z + (door.box.max.z - door.box.min.z) / 2) {
                            deltaPosition.z -= dz;
                        } else {
                            deltaPosition.z += dz;
                        }
                    }
                }
            }
        }
    }
}

export const doorManager = new DoorManager();
