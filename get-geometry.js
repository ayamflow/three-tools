import { BufferGeometry } from 'three/src/core/BufferGeometry'
import { BufferAttribute } from 'three/src/core/BufferAttribute'
import { GLTFLoader } from './overrides/GLTFLoader'
const geometryCache = {}

initCommon()

/**
 * Convenience method for loading and retrieving geometries
 *
 * @module
 * @static
 * @param {string} path The geometry URL
 * @return {THREE.BufferGeometry} 
 */
export async function getGeometry(path) {
    let geometry = geometryCache[path]
    if (geometry) return geometry

    let extension = path.split('.').pop()
    let loader

    return new Promise(async (resolve, reject) => {
        switch(extension) {
            case 'json':
                throw new Error('JSON Loader is not supported anymore')
                // let data = await fetch(path)
                // loader = new JSONLoader()
                // geometry = loader.parse(data).geometry
                // geometryCache[path] = geometry
                // resolve(geometry)
                break
    
            case 'glb':
            case 'gltf':
                loader = new GLTFLoader().load(path, gltf => {
                    geometryCache[path] = gltf
                    resolve(gltf)
                })
                break
        }
    })
}

function initCommon() {
    const quad = new BufferGeometry()
    quad.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2))
    quad.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2))
    geometryCache.quad = quad
}