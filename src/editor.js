const Layout = require('@apexearth/layout')
const draw   = require('@apexearth/layout-draw')
const offset = require('mouse-event-offset')
require('./editor.less')
const React = require('react')

class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state       = {
            layout      : props.layout,
            scale       : 25,
            mouseDown   : null,
            mouseCurrent: null,
        }
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseUp   = this.onMouseUp.bind(this)
    }

    onMouseDown(event) {
        if (this.state.mouseDown) return
        let coord = this.coordinates(event)
        this.setState({
            mouseDown   : coord,
            mouseCurrent: coord,
        })
        this.createSection(coord, coord)
    }

    onMouseMove(event) {
        if (!this.state.mouseDown) return
        let coord = this.coordinates(event)
        if (coord[0] !== this.state.mouseCurrent[0] ||
            coord[1] !== this.state.mouseCurrent[1]) {
            this.setState({
                mouseCurrent: coord
            })
            this.createSection(this.state.mouseDown, coord)
        }
    }

    onMouseUp(event) {
        if (!this.state.mouseDown) return
        this.setState({
            mouseDown   : null,
            mouseCurrent: null,
            section     : null,
        })
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

    createSection(mouseDown, mouseCurrent) {
        if (this.state.section) {
            this.state.section.remove()
        }
        let bounds = {
            left  : Math.min(mouseDown[0], mouseCurrent[0]),
            top   : Math.min(mouseDown[1], mouseCurrent[1]),
            right : Math.max(mouseDown[0], mouseCurrent[0]),
            bottom: Math.max(mouseDown[1], mouseCurrent[1]),
        }
        this.setState({
            section: this.layout.add(bounds)
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