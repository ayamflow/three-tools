import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget'
import { Scene } from 'three/src/scenes/Scene'
import { DepthTexture } from 'three/src/textures/DepthTexture'
import { LinearFilter, RGBAFormat } from 'three/src/constants'
import { stage } from './'
import { Pipeline } from './pipeline'
import size from 'size'

/**
 * A container scene that can render either to the screen or to a RenderTarget, and have its own postprocessing stack
 *
 * @class RenderScene
 * @extends {THREE.Scene}
 */
export class RenderScene extends Scene {
    /**
     * Creates an instance of RenderScene.
     * @param {boolean} [renderToScreen=false] True to render to the screen, false to render to a RenderTarget
     * @param {THREE.Camera} [camera=stage.camera] The camera to use to render the scene
     * @param {number} [pixelRatio=stage.pixelRatio] The pixelRatio to use to render the scene
     * @memberof RenderScene
     */
    constructor(options = {}) {
        super()

        if (!options.renderToScreen) {
            this.initRT(options)
        }
        this.camera = options.camera || stage.camera
        this.pixelRatio = stage.pixelRatio
        this.pipeline = new Pipeline({
            scene: this,
            rt: this.rt,
            camera: this.camera,
            renderToScreen: options.renderToScreen
        })

        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
        this.onResize(size.width, size.height)
    }

    onResize(width, height) {
        this.pipeline.setSize(width * this.pixelRatio, height * this.pixelRatio)
    }

    /**
     * Call to disable automatic resizing and manually control the scene RenderTarget size
     *
     * @param {number} width
     * @param {height} height
     * @memberof RenderScene
     */
    setSize(width, height) {
        size.removeListener(this.onResize)
        this.onResize(width, height)
    }

    initRT(options) {
        this.rt = new WebGLRenderTarget(1, 1, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: options.format || RGBAFormat,
            depthBuffer: options.depthBuffer,
            stencilBuffer: options.stencilBuffer,
            generateMipmaps: options.generateMipmaps || false,
        })

        if (options.useDepthTexture === true) {
            this.rt.depthTexture = new DepthTexture()
        }
    }
    
    /**
     * Add a new Pass to the local Pipeline
     *
     * @param {Pass} pass
     * @memberof RenderScene
     */
    addPass(pass) {
        this.pipeline.addPass(pass)
    }
    
    /**
     * Remove a Pass from the local Pipeline
     *
     * @param {Pass} pass
     * @memberof RenderScene
     */
    removePass(pass) {
        this.pipeline.removePass(pass)
    }

    /**
     * Render the scene and its Pipeline
     *
     * @memberof RenderScene
     */
    render() {
        this.pipeline.render()
    }

    /**
     * Return the RenderTarget texture
     *
     * @readonly
     * @memberof RenderScene
     */
    get texture() {
        return this.rt.texture
    }

    /**
     * Return the RenderTarget depthTexture
     *
     * @readonly
     * @memberof RenderScene
     */
    get depthTexture() {
        return this.rt.depthTexture
    }

    /**
     * Add overlay of the scene's RenderTarget on top of the window for debugging purposes
     *
     * @memberof RenderScene
     */
    debug() {
        if (!this.rt) return
        // stage.addDebug(this.rtIn.texture)
        stage.addDebug(this.rt.texture)
    }

    // set overrideMaterial(value) {
    //     this.overrideMaterial = value
    // }

    // set camera(camera) {
    //     this.camera = camera
    //     this.pipeline.camera = camera
    // }
}