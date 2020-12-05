export function addShaderGUI(GUI, shader, options) {
    // create panel and controls to GUI
    let panel = GUI.addGroup({
        label: shader.name || shader.uuid,
        enable: false
    })

    for (let uniform in shader.uniforms) {
        let obj = shader.uniforms[uniform]
        if (obj.useGUI === false) continue

        if (obj.value === null || obj.value === undefined) continue

        if (obj.value.isVector2) {
            // 2x number
            panel.addSubGroup()
                .addNumberInput(obj.value, 'x', {
                    label: uniform + ' x'
                })
                .addNumberInput(obj.value, 'y', {
                   label: uniform + ' y'
                })
        } else if (obj.value.isVector3) {
            // 3x number
            panel.addSubGroup()
                .addNumberInput(obj.value, 'x', {
                    label: uniform + ' x'
                })
                .addNumberInput(obj.value, 'y', {
                   label: uniform + ' y'
                })
                .addNumberInput(obj.value, 'z', {
                   label: uniform + ' z'
                })
        } else if (obj.value.isColor) {
            // color
            // a bit more logic to work with THREE.Color

            let color = {
                value: [obj.value.r, obj.value.g, obj.value.b]
            }
            panel.addColor(color, 'value', {
                label: uniform,
                colorMode: 'rgb',
                onChange: function() {
                    obj.value.setRGB(color.value[0] / 256, color.value[1] / 256, color.value[2] / 256)
                }
            })
        } else if (obj.value === true || obj.value === false) {
            // checkbox
            panel.addCheckbox(obj, 'value', {
                label: uniform
            })
        } else if (typeof obj.value == 'number') {
            // number
            panel.addNumberInput(obj, 'value', {
                label: uniform,
                dp: 5,
                step: 0.001
            })
        }

    }
}