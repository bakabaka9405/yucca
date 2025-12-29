import { watch, watchEffect, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSceneStore } from '../stores/sceneStore';
import viewer from '../engine/Viewer';
import engine from '../engine/Engine';
import * as THREE from 'three/webgpu';
import { colliderManager } from '../engine/ColliderManager';

const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeDeg180 = (deg: number) => {
    const wrapped = ((deg + 180) % 360 + 360) % 360 - 180;
    return wrapped === -180 ? 180 : wrapped;
};

function cartesianToSpherical(position: { x: number; y: number; z: number }) {
    const { x, y, z } = position;
    const radius = Math.sqrt(x * x + y * y + z * z);
    const azimuthRad = Math.atan2(x, -z);
    const horizontal = Math.sqrt(x * x + z * z);
    const elevationRad = Math.atan2(y, horizontal);
    return {
        radius,
        azimuthDeg: normalizeDeg180(radToDeg(azimuthRad)),
        elevationDeg: clamp(radToDeg(elevationRad), -89, 89),
    };
}

function sphericalToCartesian(azimuthDeg: number, elevationDeg: number, radius: number) {
    const azimuthRad = degToRad(azimuthDeg);
    const elevationRad = degToRad(clamp(elevationDeg, -89, 89));
    const safeRadius = Math.max(0, radius);
    const horizontal = safeRadius * Math.cos(elevationRad);
    const x = horizontal * Math.sin(azimuthRad);
    const z = -horizontal * Math.cos(azimuthRad);
    const y = safeRadius * Math.sin(elevationRad);

    return {
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        z: parseFloat(z.toFixed(2)),
    };
}

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
        sunRadius,
        sunAzimuthDeg,
        sunElevationDeg,
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

    // --- Spherical Sun Position Sync (Store <-> Store) ---

    let syncingFromSpherical = false;
    let syncingFromCartesian = false;

    watch(
        sunPosition,
        (pos) => {
            if (syncingFromSpherical) return;
            syncingFromCartesian = true;
            const spherical = cartesianToSpherical(pos);
            if (spherical.radius > 0) {
                sunRadius.value = parseFloat(spherical.radius.toFixed(2));
            }
            sunAzimuthDeg.value = spherical.azimuthDeg;
            sunElevationDeg.value = spherical.elevationDeg;
            syncingFromCartesian = false;
        },
        { deep: true, immediate: true }
    );

    watch(
        [sunAzimuthDeg, sunElevationDeg, sunRadius],
        ([azimuthDeg, elevationDeg, radius]) => {
            if (syncingFromCartesian) return;
            syncingFromSpherical = true;
            sunPosition.value = sphericalToCartesian(azimuthDeg, elevationDeg, radius);
            syncingFromSpherical = false;
        },
        { immediate: true }
    );

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
