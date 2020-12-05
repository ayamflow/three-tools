import { ShaderMaterial } from 'three'
import GUI from './gui'
import Uniforms from './uniforms'
// import sniffer from 'sniffer'

// const GLSLIFY_REGEX = /#import ([a-zA-Z0-9_-]+) from ([a-zA-Z0-9_-]+)/g

export default class Shader extends ShaderMaterial {
    constructor(options = {}) {
        let useGUI = options.useGUI
        delete options.useGUI

        super(Object.assign({
            vertexShader: options.vertexShader || Shader.defaultVertexShader,
            fragmentShader: options.fragmentShader || Shader.defaultFragmentShader
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

    addGUI(options) {
        GUI.addShader(this, options)
    }

    set(key, value) {
        this.uniforms[key].value = value
    }
    
    get(key, value) {
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
    defaultVertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    defaultFragmentShader: `
        varying vec2 vUv;

        void main() {
            gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
    `
})
