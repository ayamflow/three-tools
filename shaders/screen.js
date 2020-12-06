import { Shader } from '../shader'
import { uniforms as Uniforms } from '../uniforms'

export class ScreenShader extends Shader {
    constructor(options = {}) {
        super({
            vertexShader: `
                void main() {
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }`,
            fragmentShader: `
                uniform sampler2D tMap;
                uniform vec2 resolution;
                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    gl_FragColor = texture2D(tMap, uv);
                    gl_FragColor.a = 1.0;
                }`,
            uniforms: {
                tMap: options.tMap,
                resolution: Uniforms.resolution
            },
            // depthTest: options.depthTest,
            // depthWrite: options.depthWrite,
            // transparent: options.transparent,
        })
    }
}