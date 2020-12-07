import { Scene, Mesh, Vector2 } from 'three'
import { Shader, getGeometry, stage } from '../'

/**
 * A postprocessing pass working with a Pipeline
 *
 * @class Pass
 * @extends {THREE.Scene}
 */
export class Pass extends Scene {
    /**
     * Creates an instance of Pass.
     * @param {boolean} [renderToScreen = false] To render to screen or to a RenderTarget
     * @param {THREE.Camera} [camera = stage.camera] The camera to use to render
     * @param {string} [vertexShader=] The pass's vertex shader
     * @param {string} [fragmentShader=] The pass's fragment shader
     * @param {Object} [uniforms={}] The pass's shader uniforms
     * @memberof Pass
     */
    constructor(options) {
        super()

        this.renderToScreen = options.renderToScreen || false
        this.camera = options.camera || stage.camera
        this.resolution = new Vector2()

        if (options.vertexShader && options.fragmentShader) {
            this.addQuad(new Shader({
                vertexShader: options.vertexShader,
                fragmentShader: options.fragmentShader,
                uniforms: options.uniforms || {}
            }))
        }
    }

    /**
     * Resize the pass and its shader's resolution uniform
     *
     * @param {*} width
     * @param {*} height
     * @memberof Pass
     */
    resize(width, height) {
        this.resolution.set(width, height)
    }

    /**
     * Render the pass. To be overriden in custom passes
     *
     * @param {THREE.WebGLRenderer} renderer The renderer to use
     * @param {THREE.RenderTarget} rtIn the source RenderTarget
     * @param {THREE.RenderTarget} rtOut the destination RenderTarget
     * @memberof Pass
     */
    render(renderer, rtIn, rtOut) {
        throw new Error('[Pass] You need to override .render', this)
    }

    /**
     * Render the pass to screen
     *
     * @param {THREE.WebGLRenderer} renderer The render to use
     * @memberof Pass
     */
    renderToScreen(renderer) {
        renderer.setRenderTarget(null)
        renderer.render(this, this.camera)
    }

    /**
     * Render the pass to a RenderTarget
     *
     * @param {THREE.WebGLRenderer} renderer The render to use
     * @param {THREE.WebGLRenderTarget} rt The RenderTarget to render to
     * @memberof Pass
     */
    renderToRT(renderer, rt) {
        renderer.setRenderTarget(rt)
        renderer.render(this, this.camera)
    }

    addQuad(shader) {
        shader.uniforms.resolution = { value: this.resolution }
        const geometry = getGeometry('quad')
        let quad = new Mesh(geometry, shader)
        quad.frustumCulled = false
        this.add(quad)
        this.shader = shader
    }
}