import { Scene, WebGLRenderTarget, LinearFilter, RGBAFormat, DepthTexture } from 'three'
import { stage } from './stage'
import { Pipeline } from './pipeline'

export class RenderScene extends Scene {
    constructor(options = {}) {
        super()

        if (options.renderToScreen) {
            this.initRT(options)
        }
        this.camera = options.camera || stage.camera

        this.pipeline = new Pipeline({
            scene: this,
            rt: this.rt,
            camera: this.camera,
            renderToScreen: options.renderToScreen
        })
    }

    onResize(width, height) {
        if (this.rt) this.rt.setSize(width, height)
    }

    initRT(options) {
        this.rt = new WebGLRenderTarget(100, 400, {
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