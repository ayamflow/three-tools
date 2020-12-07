import { Scene, Mesh, Vector2 } from 'three'
import { Shader, getGeometry, stage } from '../'

export class Pass extends Scene {
    constructor(options) {
        super()

        this.renderToScreen = options.renderToScreen || false
        this.camera = options.camera || stage.camera
        this.resolution = new Vector2()

        if (options.vertexShader && options.fragmentShader) {
            this.addQuad(new Shader({
                vertexShader: options.vertexShader,
                fragmentShader: options.fragmentShader,
                uniforms: options.uniforms
            }))
        }
    }

    resize(width, height) {
        this.resolution.set(width, height)
    }

    render(renderer, rtIn, rtOut) {
        throw new Error('[Pass] You need to override .render', this)
    }

    renderToScreen(renderer) {
        renderer.setRenderTarget(null)
        renderer.render(this, this.camera)
    }

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