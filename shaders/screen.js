import { Shader } from '../shader'
import { uniforms as Uniforms } from '../uniforms'

/**
 * A shader that runs in fullscreen, bypassing any camera
 *
 * @class ScreenShader
 * @extends {Shader}
 */
export class ScreenShader extends Shader {
    /**
     * Creates an instance of ScreenShader.
     * @param {string} [vertexShader=Shader.quadVertexShader] The vertex shader to use
     * @param {Object} [tMap={value: null}] The texture uniform to use
     * @memberof ScreenShader
     */
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