import { ShaderMaterial } from 'three/src/materials/ShaderMaterial'
// import { uniforms as Uniforms} from './'
import GUI from './gui'
// import Uniforms from './uniforms'
// import sniffer from 'sniffer'

// const GLSLIFY_REGEX = /#import ([a-zA-Z0-9_-]+) from ([a-zA-Z0-9_-]+)/g

/**
 * Replacement for THREE.ShaderMaterial
 *
 * @class Shader
 * @extends {THREE.ShaderMaterial}
 */
export class Shader extends ShaderMaterial {
    constructor(options = {}) {
        let useGUI = options.useGUI
        delete options.useGUI

        // options.uniforms = options.uniforms || {}
        // options.uniforms.time = Uniforms.time

        super(Object.assign({
            vertexShader: options.vertexShader || Shader.defaultVertexShader,
            fragmentShader: options.fragmentShader || Shader.defaultFragmentShader
        }, {
            // uniforms: {
            //     time: Uniforms.time,
            //     resolution: Uniforms.resolution,
            // }
        }, options))

        this.name = options.name || this.constructor.name || this.constructor.toString().match(/function ([^\(]+)/)[1]
        checkUniforms(this.name, options.uniforms)

        if (useGUI !== false) {
            // console.log(`[Shader] ${this.name} addGUI`);
            this.addGUI(options)
        }

        // TODO
        // HMR? 
    }

    /**
     * Create a GUI panel for this shader's uniforms
     *
     * @param {*} options
     * @memberof Shader
     */
    addGUI(options) {
        GUI.addShader(this, options)
    }

    /**
     * Set an uniform's value
     *
     * @param {*} key
     * @param {*} value
     * @memberof Shader
     */
    set(key, value) {
        this.uniforms[key].value = value.texture ? value.texture : value
    }
    
    /**
     * Return an uniform's value
     *
     * @param {*} key
     * @return {*} 
     * @memberof Shader
     */
    get(key) {
        return this.uniforms[key]
    }
}

function checkUniforms(name, uniforms) {
    for (let uniform in uniforms) {
        let obj = uniforms[uniform]
        if (obj.value === undefined) {
            throw new Error(`[Shader ${name}] Incorrect uniform ${uniform}`, obj)
        }
    }
}

// function parseGlslifyImport(shader) {
//     shader.replace(GLSLIFY_REGEX, '#pragma glslify: $1 = require($2)')
// }

Object.assign(Shader, {
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.defaultVertexShader
     */
    defaultVertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.quadVertexShader
     */
    quadVertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    /**
     * @memberof Shader
     * @type {string}
     * @static {string} Shader.defaultFragmentShader
     */
    defaultFragmentShader: `
        varying vec2 vUv;

        void main() {
            gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
    `
})
