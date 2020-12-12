import { Texture } from 'three/src/textures/Texture'
import { LinearFilter, ClampToEdgeWrapping } from 'three/src/constants'
export const textureCache = {}

const pixel = new Image()
pixel.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='

// TODO
/*
    - compressed textures
    https://medium.com/samsung-internet-dev/using-basis-textures-in-three-js-6eb7e104447d

    - image.decode
*/

/**
 * Convenience method for loading and retrieving textures
 *
 * @module
 * @static
 * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image The source image or its URL
 * @param {Object} [params={}] The texture parameters, including wrapping and filtering
 * @return {THREE.Texture} 
 */
export function getTexture(image, params = {}) {
    let texture
    if (image instanceof Image || image instanceof HTMLVideoElement || image instanceof HTMLCanvasElement) {
        texture = new Texture(image)
        setParams(texture, params)
        return texture
    } else {
        // Cache
        let texture = textureCache[image]
        if (texture) {
            let needsUpdate = Object.keys(params).reduce(function(reduce, key, i) {
                let value = params[key]
                return reduce || value != texture[key]
            }, false)
            setParams(texture, params)
            texture.needsUpdate = needsUpdate
            return texture
        }
        let img = new Image()
        texture = new Texture(pixel)
        textureCache[image] = texture
        texture.needsUpdate = false
        texture.promise = new Promise((resolve, reject) => {
            img.onload = function() {
                img.onload = null
                texture.image = img
                setParams(texture, params)
                resolve(texture)
            }
        })
        img.src = image
        return texture
    }
}

function setParams(texture, params = {}) {
    Object.assign(texture, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        generateMipmaps: false
    }, params)

    texture.needsUpdate = true
}