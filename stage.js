import { OrthographicCamera } from 'three/src/cameras/OrthographicCamera'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera'
import { Raycaster } from 'three/src/core/Raycaster'
import { Object3D } from 'three/src/core/Object3D'
import { Scene } from 'three/src/scenes/Scene'
import { PCFSoftShadowMap } from 'three/src/constants'
import { Mesh } from 'three/src/objects/Mesh'
import { BoxBufferGeometry } from 'three/src/geometries/BoxBufferGeometry'
import { PlaneBufferGeometry } from 'three/src/geometries/PlaneBufferGeometry'
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial'
import { MeshNormalMaterial } from 'three/src/materials/MeshNormalMaterial'
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'
import size from 'size'
// import rightNow from 'right-now'
import { Component } from './component'
import { RenderScene } from './scene'
import { mouse as Mouse } from './mouse'
import { uniforms as Uniforms } from './uniforms'
// import Stats from 'stats.js'

/**
 * Singleton holding the renderer, canvas, main scene and UI scene, and the render loop.
 *
 * @class Stage
 * @hideconstructor
 * @extends {Component}
 */
class Stage extends Component {
    constructor(){
        super()
    }

    /**
     * Configure and start rendering
     *
     * @param {HTMLCanvasElement} [options.canvas] An existing canvas element
     * @param {boolean} [alpha=false] To use transparent renderer
     * @param {boolean} [preserveDrawingBuffer=false] To preserve buffers until redraw
     * @param {string} [powerPreference='high-performance'] To force chipset or discrete GPU
     * @param {hex} [clearColor=0x000000] The default clearColor
     * @param {number} [clearAlpha=1] The default clearAlpha
     * @param {number} [pixelRatio=<devicePixelRatio>] The pixelRatio/dpi to use
     * @memberof Stage
     */
    init(options = {}) {
        this.el = options.canvas || document.createElement('canvas')
        Object.assign(this.el.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
        })

        this.renderer = new WebGLRenderer(Object.assign({
            canvas: this.el,
            antialias: false,
            alpha: options.alpha || false,
            powerPreference: options.powerPreference || 'high-performance',
            preserveDrawingBuffer: options.preserveDrawingBuffer || false
        }, options))

        this.renderer.setClearColor(options.clearColor || 0x000000, options.clearAlpha || 1)
        this.pixelRatio = options.pixelRatio || window.devicePixelRatio || 1
        this.renderer.setPixelRatio(this.pixelRatio)
        Uniforms.dpr.value = this.pixelRatio

        // Object3D.DefaultMatrixAutoUpdate = false

        // Ortho scene for 2D/UI
        this.orthoScene = new Scene()
        this.orthoCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.orthoCamera.position.z = 1

        // Main scene
        /**
         * @type THREE.PerspectiveCamera
         */
        this.camera = new PerspectiveCamera(45, 1, 1, 1000)
        this.camera.position.z = 5
        /**
         * @type RenderScene
         */
        this.scene = new RenderScene({ renderToScreen: true })
        /**
         * @type Pipeline
         */
        this.pipeline = this.scene.pipeline

        Mouse.setCamera(this.camera)
        Mouse.bind()
        this.raycaster = new Raycaster()

        // DEBUG
        // if (DEBUG) {
            //  this.stats = new Stats()
        // document.body.appendChild(this.stats.domElement)
        //     window.stage = this
        //     // let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        //     window.addControls = () => {
        //         let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        //     }
        // }

        this.onUpdate = this.onUpdate.bind(this)
        this.forceResize()

        // rAF after resize
        this.rafId = -1
        this.time = Date.now()
        this.once('resize', () => {
            this.rafId = requestAnimationFrame(this.onUpdate)
        })
    }

    /**
     * Toggle shadows on the renderer
     *
     * @param {bool} enabled True to enable, false to disable
     * @param {number} [type=THREE.PCFSoftShadowMap] The shadow type to use
     * @memberof Stage
     */
    toggleShadows(enabled, type) {
        this.renderer.shadowMap.enabled = enabled
        this.renderer.shadowMap.type = type || PCFSoftShadowMap
    }

    /**
     * Utility to raycast a set of objects with a given camera
     *
     * @param {THREE.Camera} camera The camera to use
     * @param {Object3D[]} objects An array of objects to raycast
     * @return {Object}
     * @memberof Stage
     */
    raycast(camera, objects) {
        this.raycaster.setFromCamera(Mouse.screenPosition, camera)
        if (objects.length) {
            return this.raycaster.intersectObjects(objects)
        }
        return this.raycaster.intersectObject(objects)
    }

    onResize(width, height) {
        this.renderer.setSize(width, height)

        this.orthoCamera.top = height * 0.5
        this.orthoCamera.bottom = -height * 0.5
        this.orthoCamera.left = -width * 0.5
        this.orthoCamera.right = width * 0.5
        this.orthoCamera.updateProjectionMatrix()

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        Uniforms.resize()

        if (this.debugs) {
            this.debugs.forEach(function(mesh, i) {
                mesh.position.x = -width * 0.5 + 50 + 100 * i
                mesh.position.y = -height * 0.5 + 50
            }, this)
        }

        setTimeout(() => {
            this.emit('resize')
        })
    }

    onUpdate() {
        this.rafId = requestAnimationFrame(this.onUpdate)
        let time = Date.now()
        const dt = time - this.time

        this.emit('tick', dt)
        Uniforms.update()
        this.render()
        this.time = time
    }

    render() {
        // if (this.stats) {
        //     this.stats.begin()
        // }

        this.scene.render()
        this.renderOrtho()

        // if (this.stats) {
        //     this.stats.end()
        // }
    }

    renderOrtho() {
        this.renderer.autoClear = false
        this.renderer.clearDepth()
        this.renderer.render(this.orthoScene, this.orthoCamera)
        this.renderer.autoClear = true
    }

    /**
     * Return a box mesh for debugging purposes
     *
     * @param {number} [side=10] The definition of the geometry
     * @return {THREE.Mesh} 
     * @memberof Stage
     */
    getDebugMesh(side = 10) {
        return new Mesh(
            new BoxBufferGeometry(side, side, side),
            new MeshNormalMaterial()
        )
    }

    /**
     * Overlays a given texture on top of the window for debugging purposes
     *
     * @param {THREE.Texture} texture The texture to display
     * @memberof Stage
     */
    addDebug(texture) {
        const side = 120
        this.debugs = this.debugs || []

        let mesh = new Mesh(
            new PlaneBufferGeometry(side, side),
            new MeshBasicMaterial({
                map: texture,
                // transparent: true
            })
        )
        mesh.position.x = -size.width * 0.5 + side * 0.5 + side * this.debugs.length
        mesh.position.y = -size.height * 0.5 + side * 0.5
        this.debugs.push(mesh)
        this.orthoScene.add(mesh)
    }

    /**
     * Destroys the stage
     *
     * @memberof Stage
     */
    destroy() {
        // TODO: renderer, scene
        cancelRequestAnimation(this.rafId)
        size.removeListener(this.onResize)
    }
}

export const stage = new Stage()
