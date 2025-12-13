import { watchEffect, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import viewer from '../engine/Viewer';
import * as THREE from 'three/webgpu';
import { colliderManager } from '../engine/ColliderManager';

export function useViewerSync() {
    const store = useSceneStore();
    const {
        cameraPosition,
        cameraDirection,
        isEditingPosition,
        isEditingDirection,
        movementMode,
        skyboxEnabled,
        showCollisionBoxes,
        playerPosition,
        isEditingPlayerPosition,
        environmentEnabled,
        environmentIntensity,
        gtaoEnabled,
        gtaoSamples,
        gtaoDistanceExponent,
        gtaoDistanceFallOff,
        gtaoRadius,
        gtaoScale,
        gtaoThickness,
        gtaoAoOnly,
        sunEnabled,
        sunColor,
        sunIntensity,
        sunPosition,
        ambientEnabled,
        ambientColor,
        ambientIntensity,
        spotEnabled,
        spotColor,
        spotIntensity,
        spotAngle,
        spotPenumbra,
        spotDecay,
        spotDistance
    } = storeToRefs(store);

    // --- Store -> Engine Sync ---

    // Camera Position
    watchEffect(() => {
        if (isEditingPosition.value) {
            const { x, y, z } = cameraPosition.value;
            viewer.setCameraPosition(new THREE.Vector3(x, y, z));
        }
    });

    // Camera Direction
    watchEffect(() => {
        if (isEditingDirection.value) {
            const { x, y, z } = cameraDirection.value;
            const direction = new THREE.Vector3(x, y, z);
            if (direction.lengthSq() > 0) {
                viewer.setCameraDirection(direction);
            }
        }
    });

    // Player Position
    watchEffect(() => {
        if (viewer.character?.mesh) {
            const { x, y, z } = playerPosition.value;
            viewer.character.mesh.position.set(x, y, z);
        }
    });

    // Movement Mode
    watchEffect(() => {
        viewer.setMovementMode(movementMode.value);
    });

    // Skybox
    watchEffect(() => {
        viewer.setSkyboxEnabled(skyboxEnabled.value);
    });

    // Collision Boxes
    watchEffect(() => {
        colliderManager.setVisibility(showCollisionBoxes.value);
    });

    // Environment
    watchEffect(() => {
        viewer.setEnvironmentEnabled(environmentEnabled.value);
    });

    watchEffect(() => {
        viewer.setEnvironmentIntensity(environmentIntensity.value);
    });

    // GTAO
    watchEffect(() => {
        viewer.updateGTAO({
            enabled: gtaoEnabled.value,
            samples: gtaoSamples.value,
            distanceExponent: gtaoDistanceExponent.value,
            distanceFallOff: gtaoDistanceFallOff.value,
            radius: gtaoRadius.value,
            scale: gtaoScale.value,
            thickness: gtaoThickness.value,
            aoOnly: gtaoAoOnly.value
        });
    });

    // Lights
    watchEffect(() => {
        viewer.lightManager?.updateSunLight(
            sunEnabled.value,
            sunColor.value,
            sunIntensity.value,
            { ...sunPosition.value }
        );
    });

    watchEffect(() => {
        viewer.lightManager?.updateAmbientLight(
            ambientEnabled.value,
            ambientColor.value,
            ambientIntensity.value
        );
    });

    watchEffect(() => {
        viewer.lightManager?.updateSpotLight(
            spotEnabled.value,
            spotColor.value,
            spotIntensity.value,
            spotAngle.value,
            spotPenumbra.value,
            spotDecay.value,
            spotDistance.value
        );
    });

    // --- Engine -> Store Sync ---
    
    const cleanup = viewer.onUpdate(() => {
        // Sync Camera
        if (!isEditingPosition.value) {
            store.updateCameraPosition(viewer.camera.position);
        }
        if (!isEditingDirection.value) {
            store.updateCameraDirection(viewer.getCameraDirection());
        }
        
        // Sync Player
        if (movementMode.value === 'thirdPerson' && !isEditingPlayerPosition.value && viewer.character?.mesh) {
            store.updatePlayerPosition(viewer.character.mesh.position);
        }
    });

    onUnmounted(() => {
        cleanup();
    });
}
