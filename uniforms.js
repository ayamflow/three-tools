import size from 'size'
import stage from './stage'
import Mouse from './mouse'

class Uniforms {
    constructor() {
        this.uniforms = {}

        this.add('time', {
            value: 0,
            useGUI: false
        })
        this.add('deltaTime',  {
            value: 0,
            useGUI: false
        })
        this.add('mouse2d', {
            value: Mouse.screenPosition,
            useGUI: false
        })
        this.add('mouse3d', {
            value: Mouse.worldPosition,
            useGUI: false
        })
        this.add('resolution', {
            value: new THREE.Vector3(size.width, size.height, size.width / size.height),
            useGUI: false
        })
    }

    init() {
        stage.on('tick', this.update, this)
        size.addListener(this.resize.bind(this))
        this.resize()
    }

    resize() {
        let bufferSize = stage.renderer.getDrawingBufferSize()
        this.uniforms.resolution.value.set(bufferSize.width, bufferSize.height, bufferSize.width / bufferSize.height)
        // this.uniforms.resolution.value.set(width, height, width / height)
    }

    add(name, object) {
        const uniforms = this.uniforms;
        if (uniforms[name]) return

        uniforms[name] = object

        Object.defineProperty(this, name, {
            set: function(value) {
                uniforms[name] = value
            },
            get: function() {
                return uniforms[name]
            }
        })
    }

    extend(uniforms) {
        // copy references
        for (let key in this.uniforms) {
            uniforms[key] = this.uniforms[key]
        }
        return uniforms
    }

    merge(...params) {
        let result = {}
        params.forEach(function(uniforms) {
            for (let key in uniforms) {
                result[key] = uniforms[key]
            }
        })

        return result
    }

    update(dt) {
        this.uniforms.deltaTime.value = dt / 1000
        this.uniforms.time.value += this.uniforms.deltaTime.value
    }
}

export default new Uniforms()
