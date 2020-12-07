import size from 'size'
import { Scene, Mesh, WebGLRenderTarget, OrthographicCamera, RGBAFormat, LinearFilter, Vector2 } from 'three'
import { stage, getGeometry } from '../'
import { ScreenShader } from '../shaders/screen'

/**
 * A rendering pipeline used to apply postprocessing to a RenderTarget or to the screen
 *
 * @class Pipeline
 */
export class Pipeline {

    
    /**
     * Creates an instance of Pipeline.
     * @param {Scene} scene The scene to render from
     * @param {THREE.Camera} [camera=stage.camera] The camera to render from
     * @param {boolean} [renderToScreen=false] True to render to the screen, false to render to a RenderTarget
     * @param {number} [format=THREE.RGBAFormat] The RenderTarget format
     * @param {boolean} [depthBuffer=false] To enable the depthBuffer or not
     * @param {boolean} [stencilBuffer=false] To enable the stencilBuffer or not
     * @param {boolean} [generateMipmaps=false] To generate mipmaps for the RenderTarget
     * @memberof Pipeline
     */
    constructor(options = {}) {
        this.passes = []
        this.scene = options.scene
        this.camera = options.camera || stage.camera
        this.renderToScreen = options.renderToScreen || false
        this.resolution = new Vector2()

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
    
    /**
     * Add a postprocessing Pass
     *
     * @param {Pass} pass The pass to add
     * @return {Pass} 
     * @memberof Pipeline
     */
    addPass(pass) {
        this.passes.push(pass)
        pass.resize(this.resolution.width, this.resolution.height)
        return pass
    }
    
    /**
     * Remove a postprocessing Pass
     *
     * @param {Pass} pass The pass to remove
     * @memberof Pipeline
     */
    removePass(pass) {
        this.passes.splice(this.passes.indexOf(pass), 1)
    }
    
    /**
     * Resize the pipeline, its passes and any RenderTarget
     *
     * @param {number} width
     * @param {number} height
     * @memberof Pipeline
     */
    setSize(width, height) {
        this.rtIn.setSize(width, height)
        this.rtOut.setSize(width, height)
        this.passes.forEach(pass => pass.resize(width, height))
        this.resolution.set(width, height)
    }

    /**
     * Render the pipeline and its passes
     *
     * @memberof Pipeline
     */
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