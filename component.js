import Emitter from 'tiny-emitter'
import size from 'size'

export class Component extends Emitter {
    constructor() {
        super()
        this.onResize = this.onResize.bind(this)
        size.addListener(this.onResize)
    }

    onResize(width, height) {}
    forceResize() {
        this.onResize(size.width, size.height)
    }

    destroy() {
        size.removeListener(this.onResize)
    }
}