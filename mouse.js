import { Vector2, Vector3 } from 'three'
import size from 'size'
import touches from 'touches'
const touch = touches(window, { filtered: true, preventSimulated: false })

/**
 * A singleton holding different values for the mouse in 2D and 3D
 *
 * @class Mouse
 */
class Mouse {
    constructor(options) {
        this.screenPosition = new Vector2(2, 2)
        this.screenDirection = new Vector2()
        this.screenVelocity = new Vector2()

        this.worldPosition = new Vector3()
        this.worldDirection = new Vector3()
        this.worldVelocity = new Vector3()

        this.onMove = this.onMove.bind(this)
    }

    setCamera(camera) {
        this.camera = camera
    }

    bind() {
        touch.on('move', this.onMove)
        touch.on('end', this.onMove)
    }

    unbind() {
        touch.off('move', this.onMove)
        touch.off('end', this.onMove)
    }

    onMove(event, pos) {
        // event.preventDefault()

        this.screenPosition.set(
            pos[0] / size.width * 2 - 1,
            - (pos[1] / size.height) * 2 + 1
        )

        this.worldPosition.set(this.screenPosition.x, this.screenPosition.y, 0.5)
        this.worldPosition.unproject(this.camera)
        let direction = this.worldPosition.sub(this.camera.position).normalize()
        let distance = -this.camera.position.z / direction.z
        this.worldPosition.copy(
            this.camera.position.clone()
            .add(direction.multiplyScalar(distance))
        )
    }

    update() {
        // compute velocity somehow

        // onMove: count time, if >=100ms store touch, reset time
        // in update, speed = distance / time so calculate distance between now - touch
    }
}

export const mouse = new Mouse()