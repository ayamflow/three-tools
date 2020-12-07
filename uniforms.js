import { Vector2, Vector3 } from 'three'
import size from 'size'
import { mouse as Mouse } from './mouse'
import { stage } from './stage'

/**
 * Global uniforms
 *
 * @class Uniforms
 * @hideconstructor
 */
class Uniforms {
    constructor() {
        this.uniforms = {}

        /**
         * @type {number}
         * @readonly
         * @memberof Uniforms
         * @name time
         */
        this.add('time', {
            value: 0,
            useGUI: false
        })
        /**
         * @type {number}
         * @readonly
         * @memberof Uniforms
         * @name deltaTime
         */
        this.add('deltaTime',  {
            value: 0,
            useGUI: false
        })
        /**
         * @type {Vector2}
         * @readonly
         * @memberof Uniforms
         * @name mouse2d
         */
        this.add('mouse2d', {
            value: Mouse.screenPosition,
            useGUI: false
        })
        /**
         * @type {Vector3}
         * @readonly
         * @memberof Uniforms
         * @name mouse3d
         */
        this.add('mouse3d', {
            value: Mouse.worldPosition,
            useGUI: false
        })
        /**
         * @type {float}
         * @readonly
         * @memberof Uniforms
         * @name dpr
         */
        this.add('dpr', {
            value: 1,
            useGUI: false
        })
        /**
         * @type {Vector3}
         * @readonly
         * @memberof Uniforms
         * @name resolution
         */
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

    /**
     * Add a new global uniform
     *
     * @static
     * @memberof Uniforms
     * @param {string} name The new uniform name
     * @param {Object} object The object with a .value property
     */
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

    /**
     * Copy global uniforms into a shader's uniforms
     *
     * @static
     * @memberof Uniforms
     * @param {Object} uniforms Destination uniforms
     * @return {Object} The modified uniforms
     */
    extend(uniforms) {
        // copy references
        for (let key in this.uniforms) {
            uniforms[key] = this.uniforms[key]
        }
        return uniforms
    }

    /**
     * Merge global uniforms into a shader's uniform.
     * Need to figure out diff with extend
     *
     * @static
     * @memberof Uniforms
     * @param {List} params Comma-separated list of all uniforms to merge
     * @return {Object} The resulting uniforms
     */
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
