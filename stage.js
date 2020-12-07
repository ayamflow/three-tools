import { WebGLRenderer, Object3D, Scene, PerspectiveCamera, OrthographicCamera, Raycaster, PCFSoftShadowMap, Mesh, BoxBufferGeometry, PlaneBufferGeometry, MeshNormalMaterial, MeshBasicMaterial } from 'three'
import size from 'size'
// import rightNow from 'right-now'
import { Component, RenderScene, mouse as Mouse, uniforms as Uniforms } from './'
// import Stats from 'stats.js'

class Stage extends Component {
    constructor(){
        super()
    }

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
            preserveDrawingBuffer: options.preserveDrawingBuffer || false
        }, options))

        this.renderer.setClearColor(options.clearColor || 0x000000, options.clearAlpha || 0)
        this.pixelRatio = Math.min(options.pixelRatio || window.devicePixelRatio || 1, 2)
        this.renderer.setPixelRatio(this.pixelRatio)
        Uniforms.dpr.value = this.pixelRatio

        // Object3D.DefaultMatrixAutoUpdate = false

        // Ortho scene for 2D/UI
        this.orthoScene = new Scene()
        this.orthoCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.orthoCamera.position.z = 1

        // Main scene
        this.camera = new PerspectiveCamera(45, 1, 1, 1000)
        this.camera.position.z = 5
        this.scene = new RenderScene({ renderToScreen: true })
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

    toggleShadows(enabled, type) {
        this.renderer.shadowMap.enabled = enabled
        this.renderer.shadowMap.type = type || PCFSoftShadowMap
    }

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

    getDebugMesh(side = 10) {
        return new Mesh(
            new BoxBufferGeometry(side, side, side),
            new MeshNormalMaterial()
        )
    }

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

    destroy() {
        cancelRequestAnimation(this.rafId)
        size.removeListener(this.onResize)
    }
}

export const stage = new Stage()
