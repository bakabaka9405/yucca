export interface MovementController {
    enter(): void;
    update(deltaTime: number): void;
    leave(): void;
    dispose(): void;
    setDomElement(domElement: HTMLElement): void;
}
