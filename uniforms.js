import { Vector2, Vector3 } from 'three'
import size from 'size'
import { mouse as Mouse } from './mouse'
import { stage } from './stage'

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
        this.add('dpr', {
            value: 1,
            useGUI: false
        })
        this.add('resolution', {
            value: new Vector3(size.width, size.height, size.width / size.height),
            useGUI: false
        })
    }

    resize() {
        let bufferSize = new Vector2()
        stage.renderer.getDrawingBufferSize(bufferSize)

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

export const uniforms = new Uniforms()
