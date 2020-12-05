import { Scene, Mesh, WebGLRenderTarget, OrthographicCamera, ShaderMaterial } from 'three'
import size from 'size'
import stage from '../stage'
import getGeometry from '../get-geometry'

class Pipeline {
    constructor() {
        this.passes = []
        this.ping = true;
        this.initRTs()        
        this.initQuad()
    }

    initRTs() {
        this.rt1 = new WebGLRenderTarget(size.width, size.height, {

        })
        this.rt2 = this.rt1.clone()
    }

    initQuad() {
        const geometry = getGeometry('quad')

        let shader = new ShaderMaterial({
            vertexShader: `
                attribute vec2 position;
                void main() {
                    gl_position = vec4(position, 0.0, 1.0);
                }`,
            fragmentShader: `
                precision highp float;
                void main() {
                    gl_FragColor = vec4(0.2, 0.6, 0.8, 1.0);
                }`
        })
        this.quad = new Mesh(geometry, shader)
        this.quad.frustumCulled = false
        this.scene = new Scene()
        this.scene.add(this.quad)
        this.camera = new OrthographicCamera()
    }
    
    addPass(pass) {
        passes.push(pass)
        return pass
    }
    
    removePass(pass) {
        passes.splice(passes.indexOf(pass), 1)
    }

    getRT() {
        this.ping != this.ping
        if (this.ping) return this.rt1
        return this.rt2
    }
    
    renderPasses() {
        passes.forEach(pass => pass.render(stage.renderer))
    }

    finalRender() {
        stage.renderer.setRenderTarget(null)
        stage.renderer.render(this.scene, this.camera)
    }
    
    render() {
        stage.beforeRender()
        this.renderPasses()
        // stage.renderer.setRenderTarget(this.getRT())
        stage.render()
        stage.renderOrtho()
        // stage.renderer.setRenderTarget(null)
        this.finalRender()
        stage.afterRender()
    }
}

export default new Pipeline()