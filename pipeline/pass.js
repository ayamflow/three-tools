import { Scene } from 'three'

export class Pass extends Scene {
    constructor() {
        super()
        this.resolution = new Vector2()
    }

    resize(width, height) {
        this.resolution.set(width, height)
    }

    }

    render(rtIn, rtOut) {

    }
}