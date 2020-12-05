import { Scene, OrthographicCamera } from 'three'
import Pass from './pass'
import size from 'size'

export default class OrthoPass extends Pass {
    constructor() {
        super()
        this.scene = new Scene()
        this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.camera.position.z = 1

        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
    }

    onResize(width, height) {
        this.camera.top = height * 0.5
        this.camera.bottom = -height * 0.5
        this.camera.left = -width * 0.5
        this.camera.right = width * 0.5
        this.camera.updateProjectionMatrix()
    }

    render(renderer) {
        renderer.autoClear = false
        renderer.clearDepth()
        renderer.render(this.scene, this.camera)
        renderer.autoClear = true
    }   
}