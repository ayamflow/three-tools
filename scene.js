import { Scene, WebGLRenderTarget, LinearFilter, RGBAFormat, DepthTexture } from 'three'
import { stage } from './'
import { Pipeline } from './pipeline'
import size from 'size'

export class RenderScene extends Scene {
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

        size.addListener(this.onResize, this)
    }

    onResize(width, height) {
        this.pipeline.setSize(width * this.pixelRatio, height * this.pixelRatio)
    }

    setSize(width, height) {
        size.removeListener(this.onResize, this)
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

    render() {
        this.pipeline.render()
    }

    get texture() {
        return this.rt.texture
    }

    get depthTexture() {
        return this.rt.depthTexture
    }

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