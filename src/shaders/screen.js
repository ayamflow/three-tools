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
            fragmentShader: Shader.quadFragmentShader,
            uniforms: {
                tMap: options.tMap || { value: null },
                uAlpha: options.uAlpha || { value: 1 }
            },
            // depthTest: options.depthTest,
            // depthWrite: options.depthWrite,
            // transparent: options.transparent,
        })
    }
}