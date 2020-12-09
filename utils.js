import { Vector3 } from 'three/src/math/Vector3'
import { Box3 } from 'three/src/math/Box3'

export function getObjectSize(mesh) {
    let box = new Box3().setFromObject(mesh)
    let size = new Vector3().subVectors(box.max, box.min)
    return { box, size }
}