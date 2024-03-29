import { DataTexture } from 'three/src/textures/DataTexture'
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget'
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry'
import { OrthographicCamera } from 'three/src/cameras/OrthographicCamera'
import { Mesh } from 'three/src/objects/Mesh'
import { Scene } from 'three/src/scenes/Scene'
import { FloatType, HalfFloatType, NearestFilter, RGBAFormat } from 'three/src/constants'
import { Shader } from './shader'
import { stage } from './stage'
import { uniforms as Uniforms } from './uniforms'
import sniffer from 'sniffer'
import size from 'size'

/**
 * A helper class to handle FBO and GPGPU operations
 *
 * @class FBO
 */
export class FBO {
    /**
     * Creates an instance of FBO.
     * @constructor
     * @memberof FBO
     * @param {*} [options={}]
     */
    constructor(options = {}) {
        const format = options.format || RGBAFormat
        const type = FBO.getType(stage.renderer)

        this.rt1 = createRenderTarget(options.size, type, format)
        this.rt2 = this.rt1.clone()

        this.scene = new Scene()
        this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.camera.position.z = 1

        let defaultPositionTexture = options.defaultPositionTexture || FBO.getRandomDataTexture(options.size, format, type)

        this.quad = new Mesh(
            new PlaneGeometry(1, 1),
            new Shader({
                name: 'FBO',
                uniforms: Uniforms.merge({}, options.uniforms || {}, {
                    positionTexture: {
                        value: defaultPositionTexture
                    },
                    prevPositionTexture: {
                        value: null
                    }
                }),
                fragmentShader: prependUniforms(options.simulationShader)
            })
        )
        this.scene.add(this.quad)

        this.ping = false

        if (options.debug) stage.addDebug(this.rt1.texture)
    }

    get texture() {
        return this.ping ? this.rt1.texture : this.rt2.texture
    }

    get uniforms() {
        return this.quad.material.uniforms
    }

    render() {
        stage.renderer.render(this.scene, this.camera, this.ping ? this.rt1 : this.rt2)

        this.quad.material.uniforms.prevPositionTexture.value = this.ping ? this.rt1.texture : this.rt2.texture

        this.ping = !this.ping
    }
}

function createRenderTarget(size, type, format) {
    return new WebGLRenderTarget(size, size, {
        type,
        format,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false
    })
}

function prependUniforms(shader) {
    return `
        uniform sampler2D positionTexture;
        uniform sampler2D prevPositionTexture;
    ` + shader
}

Object.assign(FBO, {
    getRandomDataTexture: function(size, format, type) {
        let dataArray = new Float32Array(size * size * 4)
        for (let i = 0; i < size * size; i++) {
            dataArray[i * 4 + 0] = (Math.random() * 2 - 1)
            dataArray[i * 4 + 1] = (Math.random() * 2 - 1)
            dataArray[i * 4 + 2] = (Math.random() * 2 - 1)
            dataArray[i * 4 + 3] = 0
        }

        let dataTexture = new DataTexture(dataArray, size, size, format || RGBAFormat, type || FloatType)
        dataTexture.minFilter = NearestFilter
        dataTexture.magFilter = NearestFilter
        dataTexture.needsUpdate = true

        return dataTexture
    },

    getType: function(renderer) {
        const gl = renderer.context
        let type = FloatType
        let ext = gl.getExtension('OES_texture_half_float')
        gl.getExtension('OES_texture_half_float_linear')
        if (sniffer.isIos && ext) {
            type = HalfFloatType
        }

        return type
    }
})