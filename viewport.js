import { Vector2, Vector3 } from 'three'
import size from 'size'
import { stage } from './stage'

const vector = new Vector3()

/**
 * Viewport calculation utils
 *
 * @module Viewport
 */


/**
 * Return the total height of the viewport in world units
 *
 * @static
 * @param {number} depth distance of reference object
 * @param {THREE.Camera} camera The current camera
 * @return {number} 
 */
// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
function visibleHeightAtDepth(depth, camera) {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z
    if ( depth < cameraOffset ) depth -= cameraOffset
    else depth += cameraOffset

    // vertical fov in radians
    const vFOV = camera.fov * Math.PI / 180

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth )
}

/**
 * Return the total width of the viewport in world units
 *
 * @static
 * @param {number} depth distance of reference object
 * @param {THREE.Camera} camera The current camera
 * @return {number} 
 */
function visibleWidthAtDepth(depth, camera) {
    const height = visibleHeightAtDepth( depth, camera )
    return height * camera.aspect
}

/**
 * Project a 2D point in screen coordinates to a 3D point against a plane
 *
 * @static
 * @param {number} x The x coordinate on the screen
 * @param {number} y The y coordinate on the screen
 * @param {THREE.Camera} camera The current camera
 * @return {Vector3} 
 */
function screenToWorld(x, y, camera) {
    vector.set(
        (x / size.width) * 2 - 1,
        - (y / size.height) * 2 + 1,
        0.5)

    // Do this before calling this method
    // camera.updateMatrixWorld()
    // camera.updateProjectionMatrix()

    vector.unproject(camera)
    let dir = vector.sub(camera.position).normalize()
    let distance = - camera.position.z / dir.z
    let pos = camera.position.clone().add(dir.multiplyScalar(distance))

    return pos
}

/**
 * Convert an object's world coordinates (3D) into screen cordinates (2D)
 *
 * @static
 * @param {Object3D} object The target object
 * @param {THREE.Camera} camera The current camera
 * @return {Vector3} 
 */
function worldToScreen(object, camera) {
    vector.setFromMatrixPosition(object.matrixWorld)
    vector.project(camera)

    let bufferSize = new Vector2()
    stage.renderer.getDrawingBufferSize(bufferSize)
    let halfWidth = bufferSize * 0.5
    let halfHeight = canvasHeight * 0.5

    vector.x = (vector.x * halfWidth) + halfWidth
    vector.y = - (vector.y * halfHeight) + halfHeight
    vector.z = 0

    return vector.clone()
}

export {
    visibleHeightAtDepth,
    visibleWidthAtDepth,
    screenToWorld,
    worldToScreen
}
