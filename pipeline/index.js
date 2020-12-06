import { Scene, Mesh, WebGLRenderTarget, OrthographicCamera, RGBAFormat, LinearFilter } from 'three'
import size from 'size'
import { stage } from '../stage'
import { Shader } from '../shader'
import { uniforms as Uniforms } from '../uniforms'
import { getGeometry } from '../get-geometry'
import { ScreenShader } from '../shaders/screen'

export class Pipeline {
    constructor(options = {}) {
        this.passes = []
        this.scene = options.scene
        this.camera = options.camera
        this.renderToScreen = options.renderToScreen

        this.initRTs(options) // TODO: only create when needed
        if (this.renderToScreen) this.initQuad()

        // TODO: inherit from resize + emitter
    }

    initRTs(options) {
        this.rtIn = new WebGLRenderTarget(400, 400, {
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
    
    render() {
        let renderedToScreen = false

        stage.renderer.setRenderTarget(this.rtOut) // TODO: use rtIn
        stage.renderer.render(this.scene, this.camera)

        // this.passes.forEach(pass => pass.render(stage.renderer, this.rtIn, this.rtOut))
        for (let i = 0; i < this.passes.length; i++) {
            let pass = this.passes[i]
            pass.render(stage.renderer, this.rtIn, this.rtOut)
            if (pass.renderToScreen) renderedToScreen = true
        }

        // Automatic render/copy pass if none has been declared
        if (this.renderToScreen && !renderedToScreen) {
            stage.renderer.setRenderTarget(null)
            stage.renderer.render(this.screenScene, stage.camera)
        }
    }
}