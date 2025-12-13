import * as THREE from 'three/webgpu';
import { sample, pass, mrt, screenUV, normalView, velocity, vec3, vec4, directionToColor, colorToDirection, builtinAOContext } from 'three/tsl';
import GTAONode, { ao } from 'three/addons/tsl/display/GTAONode.js';
import TRAANode, { traa } from 'three/addons/tsl/display/TRAANode.js';

export interface GTAOParams {
    enabled: boolean;
    samples: number;
    distanceExponent: number;
    distanceFallOff: number;
    radius: number;
    scale: number;
    thickness: number;
    aoOnly: boolean;
}

export class PostProcessing {
    postProcessing: THREE.PostProcessing;
    aoPass: GTAONode;
    traaPass: TRAANode;
    scenePass: THREE.PassNode;

    constructor(renderer: THREE.WebGPURenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.postProcessing = new THREE.PostProcessing(renderer);

        // Pre-pass
        const prePass = pass(scene, camera);
        prePass.setMRT(mrt({
            output: directionToColor(normalView),
            velocity: velocity
        }));

        const prePassNormal = sample((uv) => {
            return colorToDirection(prePass.getTextureNode().sample(uv));
        });

        const prePassDepth = prePass.getTextureNode('depth');
        const prePassVelocity = prePass.getTextureNode('velocity');

        // Scene pass
        this.scenePass = pass(scene, camera);

        // AO
        this.aoPass = ao(prePassDepth, prePassNormal, camera);
        this.aoPass.resolutionScale = 0.5;
        this.aoPass.useTemporalFiltering = true;

        const aoPassOutput = this.aoPass.getTextureNode();

        // Scene context
        this.scenePass.contextNode = builtinAOContext(aoPassOutput.sample(screenUV).r);

        // Final output + TRAA
        this.traaPass = traa(this.scenePass, prePassDepth, prePassVelocity, camera);
        this.traaPass.useSubpixelCorrection = false;

        this.postProcessing.outputNode = this.traaPass;
    }

    update(params: GTAOParams) {
        if (!this.aoPass) return;

        this.aoPass.samples.value = params.samples;
        this.aoPass.distanceExponent.value = params.distanceExponent;
        this.aoPass.distanceFallOff.value = params.distanceFallOff;
        this.aoPass.radius.value = params.radius;
        this.aoPass.scale.value = params.scale;
        this.aoPass.thickness.value = params.thickness;

        if (params.enabled) {
            if (params.aoOnly) {
                this.postProcessing.outputNode = vec4(vec3(this.aoPass.r), 1);
            } else {
                this.postProcessing.outputNode = this.traaPass;
            }
        }

        this.postProcessing.needsUpdate = true;
    }

    render() {
        this.postProcessing.render();
    }
}
