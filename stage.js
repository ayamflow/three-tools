import size from 'size'
import sniffer from 'sniffer'
// import Stats from 'stats.js'
import rightNow from 'right-now'
import Mouse from './mouse'
import Uniforms from './uniforms'
import Emitter from 'tiny-emitter'

const DEBUG = process.env.ENV == 'dev'

class Stage extends Emitter {
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
        TweenMax.set(this.el, {opacity: 0})

        this.renderer = new THREE.WebGLRenderer(Object.assign({
            canvas: this.el,
            antialias: false,
            alpha: false,
            preserveDrawingBuffer: true
        }, options))

        this.renderer.setClearColor(0x000000, 0)
        // this.renderer.setClearColor(0x222222, 1)

        this.pixelRatio = Math.min(options.pixelRatio || window.devicePixelRatio || 1, 2)
        this.renderer.setPixelRatio(this.pixelRatio)

        // THREE.Object3D.DefaultMatrixAutoUpdate = false

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000)
        this.camera.position.z = 300

        this.orthoScene = new THREE.Scene()
        this.orthoCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2)
        this.orthoCamera.position.z = 1

        Mouse.setCamera(this.camera)
        Mouse.bind()
        this.raycaster = new THREE.Raycaster()

        // DEBUG
        if (DEBUG) {
            window.stage = this
            // let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
           //  this.stats = new Stats()
           // document.body.appendChild(this.stats.domElement)
            window.addControls = () => {
                let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
            }
        }

        this.onResize = this.onResize.bind(this)
        this.onUpdate = this.onUpdate.bind(this)

        // Resize
        size.addListener(this.onResize)
        this.onResize(size.width, size.height)
        Uniforms.init()

        // rAF after resize
        this.rafId = -1
        this.time = rightNow()
        this.once('resize', () => {
            this.rafId = requestAnimationFrame(this.onUpdate)
        })
    }

    toggleShadows(enabled, type) {
        this.renderer.shadowMap.enabled = enabled
        this.renderer.shadowMap.type = type || THREE.PCFSoftShadowMap
    }

    togglePostprocessing(enabled) {
        this.hasPostprocessing = enabled
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

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        this.orthoCamera.top = height * 0.5
        this.orthoCamera.bottom = -height * 0.5
        this.orthoCamera.left = -width * 0.5
        this.orthoCamera.right = width * 0.5
        this.orthoCamera.updateProjectionMatrix()

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

    beforeRender() {
        if (this.stats) {
            this.stats.begin()
        }
    }

    onUpdate() {
        this.rafId = requestAnimationFrame(this.onUpdate)
        let time = rightNow()
        const dt = time - this.time

        this.emit('tick', dt)

        if (!this.hasPostprocessing) {
            this.beforeRender()
            this.renderer.render(this.scene, this.camera)
            this.renderOrtho()
            this.afterRender()
        }

        this.time = time
    }

    renderOrtho() {
        this.renderer.autoClear = false
        this.renderer.clearDepth()
        this.renderer.render(this.orthoScene, this.orthoCamera)
        this.renderer.autoClear = true
    }

    afterRender() {
        if (this.stats) {
            this.stats.end()
        }
    }

    getDebugMesh(side = 10) {
        return new THREE.Mesh(
            new THREE.BoxBufferGeometry(side, side, side),
            new THREE.MeshNormalMaterial()
        )
    }

    addDebug(texture) {
        const side = 120
        this.debugs = this.debugs || []

        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(side, side),
            new THREE.MeshBasicMaterial({
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

export default new Stage()
