import size from 'size'
import { Scene, Mesh, WebGLRenderTarget, OrthographicCamera, RGBAFormat, LinearFilter } from 'three'
import { stage, getGeometry } from '../'
import { ScreenShader } from '../shaders/screen'

export class Pipeline {
    constructor(options = {}) {
        this.passes = []
        this.scene = options.scene
        this.camera = options.camera
        this.renderToScreen = options.renderToScreen

        this.initRTs(options) // TODO: only create when needed
        if (this.renderToScreen) this.initQuad()
    }

    initRTs(options) {
        this.rtIn = new WebGLRenderTarget(1, 1, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: options.format || RGBAFormat,
            depthBuffer: options.depthBuffer,
            stencilBuffer: options.stencilBuffer,
            generateMipmaps: options.generateMipmaps || false,
        })
        this.rtOut = options.rt || this.rtIn.clone()
    }

    initQuad() {
        const geometry = getGeometry('quad')

        let shader = new ScreenShader({
            tMap: {value: this.rtOut.texture}
        })
        let quad = new Mesh(geometry, shader)
        quad.frustumCulled = false
        this.screenScene = new Scene()
        this.screenScene.add(quad)
    }
    
    addPass(pass) {
        this.passes.push(pass)
        return pass
    }
    
    removePass(pass) {
        this.passes.splice(this.passes.indexOf(pass), 1)
    }
    
    setSize(width, height) {
        this.rtIn.setSize(width, height)
        this.rtOut.setSize(width, height)
    }

    render() {
        let renderedToScreen = false
        let rtIn = this.rtIn
        let rtOut = this.rtOut

        stage.renderer.setRenderTarget(this.passes.length ? this.rtIn : this.rtOut)
        stage.renderer.render(this.scene, this.camera)

        for (let i = 0; i < this.passes.length; i++) {
            let pass = this.passes[i]
            pass.render(stage.renderer, rtIn, rtOut)
            if (pass.renderToScreen) renderedToScreen = true
            if (pass.needsSwap) {
                let rt = rtIn
                rtOut = rtIn
                rtIn = rt
            }
        }

        // Automatic render/copy pass if none has been declared
        if (this.renderToScreen && !renderedToScreen) {
            stage.renderer.setRenderTarget(null)
            stage.renderer.render(this.screenScene, stage.camera)
        }
    }
}