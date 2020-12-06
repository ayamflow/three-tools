import { Texture, LinearFilter, ClampToEdgeWrapping } from 'three'
export const textureCache = {}

export function getTexture(image, params = {}) {
    let texture
    if (image instanceof Image || image instanceof HTMLVideoElement || image instanceof HTMLCanvasElement) {
        texture = new Texture(image)
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
        texture = new Texture()
        texture.promise = new Promise((resolve, reject) => {
            img.onload = function() {
                img.onload = null
                texture.image = img
                texture.needsUpdate = true
                resolve(texture)
            }
        })
    }

    setParams(texture, params)
    return texture
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