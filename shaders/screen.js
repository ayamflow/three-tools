import { Shader } from '../shader'
import { uniforms as Uniforms } from '../uniforms'

export class ScreenShader extends Shader {
    constructor(options = {}) {
        super({
            vertexShader: Shader.quadVertexShader,
            fragmentShader: `
                uniform sampler2D tMap;
                uniform vec2 resolution;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = texture2D(tMap, vUv);
                    gl_FragColor.a = 1.0;
                }`,
            uniforms: {
                tMap: options.tMap || { value: null },
                resolution: Uniforms.resolution
            },
            // depthTest: options.depthTest,
            // depthWrite: options.depthWrite,
            // transparent: options.transparent,
        })
    }
}