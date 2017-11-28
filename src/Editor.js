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
            corner       : '',
            mouseLeftDown: null,
            mouseCurrent : null,
        }
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseUp   = this.onMouseUp.bind(this)
    }

    onMouseDown(event) {
        if (event.button === 0) {
            if (this.state.mouseLeftDown) return
            let coord   = this.coordinates(event)
            let section = this.layout.sectionsAt(coord[0], coord[1], this.layout.currentSection)[0]
            if (section) {
                this.rotateSectionType(section)
                this.draw()
            } else {
                this.setState({
                    mouseLeftDown: coord,
                    mouseCurrent : coord,
                })
            }
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            if (!this.state.mouseLeftDown) return
            this.layout.currentSection = undefined
            this.setState({
                mouseLeftDown: null,
                mouseCurrent : null,
            })
        }
    }

    onMouseMove(event) {
        if (!this.state.mouseLeftDown) return
        let coord = this.coordinates(event)
        if (coord[0] !== this.state.mouseCurrent[0] || coord[1] !== this.state.mouseCurrent[1]) {
            this.setState({mouseCurrent: coord})
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

    createSection(left, top, right, bottom, corner) {
        if (this.layout.currentSection) {
            this.layout.currentSection.remove()
            this.layout.currentSection = undefined
        }
        const section              = this.layout.add({left, top, right, bottom, corner})
        this.layout.currentSection = section
        return section
    }

    _createSectionWithin() {
        let xDirection = this.state.mouseCurrent[0] < this.state.mouseLeftDown[0] ? 1 : -1
        let yDirection = this.state.mouseCurrent[1] < this.state.mouseLeftDown[1] ? 1 : -1
        let left       = Math.min(this.state.mouseLeftDown[0], this.state.mouseCurrent[0])
        let right      = Math.max(this.state.mouseLeftDown[0], this.state.mouseCurrent[0])
        for (; left <= right; xDirection > 0 ? left += xDirection : right += xDirection) {
            let top    = Math.min(this.state.mouseLeftDown[1], this.state.mouseCurrent[1])
            let bottom = Math.max(this.state.mouseLeftDown[1], this.state.mouseCurrent[1])
            for (; top <= bottom; yDirection > 0 ? top += yDirection : bottom += yDirection) {
                if (this.layout.isEmptyWithin(left, top, right, bottom, this.layout.currentSection)) {
                    return this.createSection(left, top, right, bottom, this.state.corner)
                }
            }
        }
    }

    rotateSectionType(section) {
        if (section.corner === '') {
            section.corner = 'top-left'
        } else if (section.corner === 'top-left') {
            section.corner = 'top-right'
        } else if (section.corner === 'top-right') {
            section.corner = 'bottom-left'
        } else if (section.corner === 'bottom-left') {
            section.corner = 'bottom-right'
        } else if (section.corner === 'bottom-right') {
            section.corner = ''
        }
    }

    componentDidMount() {
        if (!this.state.layout) {
            this.new()
        }
    }

    componentWillUpdate() {
    }

    componentDidUpdate() {
        if (this.state.mouseLeftDown) {
            this._createSectionWithin()
        }
        this.draw()
    }

    render() {
        if (!this.layout) return null
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