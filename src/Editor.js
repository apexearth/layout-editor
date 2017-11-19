const Layout = require('@apexearth/layout')
const draw   = require('@apexearth/layout-draw')
const offset = require('mouse-event-offset')
require('./Editor.less')
const React = require('react')

class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state       = {
            layout       : props.layout,
            scale        : 25,
            mouseLeftDown: null,
            mouseCurrent : null,
        }
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseUp   = this.onMouseUp.bind(this)
    }

    handleMouseLeftDown(event) {
        if (this.state.mouseLeftDown) return
        let coord   = this.coordinates(event)
        let section = this.layout.sectionsAt(coord[0], coord[1], this.state.section)[0]
        if (section) {

        } else {
            this.setState({
                mouseLeftDown: coord,
                mouseCurrent : coord,
            })
            this.createSection(coord[0], coord[1], coord[0], coord[1])
        }
    }

    handleMouseLeftUp(event) {
        if (!this.state.mouseLeftDown) return
        this.setState({
            mouseLeftDown: null,
            mouseCurrent : null,
            section      : null,
        })
    }

    onMouseDown(event) {
        if (event.button === 0) {
            this.handleMouseLeftDown(event)
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.handleMouseLeftUp(event)
        }
    }

    onMouseMove(event) {
        if (!this.state.mouseLeftDown) return
        let coord = this.coordinates(event)
        if (coord[0] !== this.state.mouseCurrent[0] || coord[1] !== this.state.mouseCurrent[1]) {
            this.setState({mouseCurrent: coord})
            const left   = Math.min(this.state.mouseLeftDown[0], this.state.mouseCurrent[0])
            const top    = Math.min(this.state.mouseLeftDown[1], this.state.mouseCurrent[1])
            const right  = Math.max(this.state.mouseLeftDown[0], this.state.mouseCurrent[0])
            const bottom = Math.max(this.state.mouseLeftDown[1], this.state.mouseCurrent[1])
            if (this.layout.isEmptyWithin(left, top, right, bottom, this.state.section)) {
                this.createSection(left, top, right, bottom)
            }
        }
    }


    get layout() {
        return this.state.layout
    }

    coordinates(event) {
        let coord = offset(event, this.refs.canvas)
        coord[0]  = Math.floor(coord[0] / this.state.scale) + 1
        coord[1]  = Math.floor(coord[1] / this.state.scale) + 1
        return coord
    }

    createSection(left, top, right, bottom) {
        if (this.state.section) {
            this.state.section.remove()
        }
        this.setState({
            section: this.layout.addSection(left, top, right, bottom)
        })
    }

    componentDidMount() {
        if (!this.state.layout) {
            this.new()
        }
    }

    render() {
        if (!this.layout) return null
        // Hacky way to do this o_0
        setImmediate(() => this.draw())
        return (
            <div className="layout-editor"
                 onMouseDown={this.onMouseDown}
                 onMouseMove={this.onMouseMove}
                 onMouseUp={this.onMouseUp}>
                <canvas ref="canvas"/>
            </div>
        )
    }

    draw() {
        let context                   = this.refs.canvas.getContext('2d')
        context.imageSmoothingEnabled = false
        draw(this.layout, {
            canvas: this.refs.canvas,
            scaleX: this.state.scale,
            scaleY: this.state.scale,
            width : this.layout.bounds.right,
            height: this.layout.bounds.bottom,
        })
    }

    new() {
        const layout = new Layout()
        this.setState({layout})
    }

    static mount(element) {
        const ReactDOM = require('react-dom')
        const editor   = <Editor/>
        ReactDOM.render(editor, element)
    }
}

module.exports = Editor

if (typeof window !== 'undefined') {
    window['layout-editor'] = Editor
}