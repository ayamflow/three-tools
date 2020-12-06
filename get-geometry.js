import { JSONLoader, BufferGeometry, BufferAttribute } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const geometryCache = {}

initCommon()

export function getGeometry(path, cb) {
    let geometry = geometryCache[path]
    if (geometry) return geometry

    let data = assets.get(path)
    let extension = path.split('.').pop()
    let dir = path.split('/')
    let root = process.env.paths.assetsURL + dir.slice(0, dir.length - 1).join('/') + '/'
    let parser

    switch(extension) {
        case 'json':
            parser = new JSONLoader()
            geometry = parser.parse(data).geometry
            geometryCache[path] = geometry
            cb(geometry)
            break

        case 'glb':
        case 'gltf':
            parser = new GLTFLoader()
            parser.parse(data, root, (gltf) => {
                geometryCache[path] = gltf
                cb(gltf)
            })
            break
    }
}

function initCommon() {
    const quad = new BufferGeometry()
    quad.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2))
    geometryCache.quad = quad
}