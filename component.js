import Emitter from 'tiny-emitter'
import size from 'size'

export class Component extends Emitter {
    constructor() {
        super()
        size.addListener(this.onResize, this)
    }

    onResize(width, height) {}

    destroy() {
        size.removeListener(this.onResize, this)
    }
}