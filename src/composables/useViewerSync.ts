import { watchEffect, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import viewer from '../engine/Viewer';
import engine from '../engine/Engine';
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
        showHeatmap,
        envHeatmapLayer,
        showCollisionBoxes,
        statsVisible,
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
            engine.setCameraPosition(new THREE.Vector3(x, y, z));
        }
    });

    // Camera Direction
    watchEffect(() => {
        if (isEditingDirection.value) {
            const { x, y, z } = cameraDirection.value;
            const direction = new THREE.Vector3(x, y, z);
            if (direction.lengthSq() > 0) {
                engine.setCameraDirection(direction);
            }
        }
    });

    // Player Position
    watchEffect(() => {
        if (isEditingPlayerPosition.value && engine.character?.mesh) {
            const { x, y, z } = playerPosition.value;
            engine.character.mesh.position.set(x, y, z);
        }
    });

    // Movement Mode
    watchEffect(() => {
        engine.setMovementMode(movementMode.value);
    });

    // Skybox
    watchEffect(() => {
        engine.setSkyboxEnabled(skyboxEnabled.value);
    });

    // Heatmap
    watchEffect(() => {
        engine.setHeatmapVisible(showHeatmap.value);
    });

    // Env Heatmaps (mutually exclusive)
    watchEffect(() => {
        engine.setEnvHeatmapLayer(envHeatmapLayer.value);
    });

    // Collision Boxes
    watchEffect(() => {
        colliderManager.setVisibility(showCollisionBoxes.value);
    });

    // Stats
    watchEffect(() => {
        viewer.setStatsVisible(statsVisible.value);
    });

    // Environment
    watchEffect(() => {
        engine.setEnvironmentEnabled(environmentEnabled.value);
    });

    watchEffect(() => {
        engine.setEnvironmentIntensity(environmentIntensity.value);
    });

    // GTAO
    watchEffect(() => {
        engine.updateGTAO({
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
        engine.lightManager?.updateSunLight(
            sunEnabled.value,
            sunColor.value,
            sunIntensity.value,
            { ...sunPosition.value }
        );
    });

    watchEffect(() => {
        engine.lightManager?.updateAmbientLight(
            ambientEnabled.value,
            ambientColor.value,
            ambientIntensity.value
        );
    });

    watchEffect(() => {
        engine.lightManager?.updateSpotLight(
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

    const cleanup = engine.onUpdate(() => {
        // Sync Camera
        if (!isEditingPosition.value) {
            store.updateCameraPosition(viewer.camera.position);
        }
        if (!isEditingDirection.value) {
            store.updateCameraDirection(engine.getCameraDirection());
        }

        // Sync Player
        if (movementMode.value === 'thirdPerson' && !isEditingPlayerPosition.value && engine.character?.mesh) {
            store.updatePlayerPosition(engine.character.mesh.position);
        }
    });

    onUnmounted(() => {
        cleanup();
    });
}
