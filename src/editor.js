const Layout = require('@apexearth/layout')
const draw   = require('@apexearth/layout-draw')
require('./editor.less')
const React = require('react')

class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            layout: props.layout
        }
    }

    componentDidMount() {
        if (!this.state.layout) {
            this.new()
        }
    }

    render() {
        if (!this.layout) return null
        setImmediate(() => {
            draw(this.layout, {
                canvas: this.refs.canvas,
                scaleX: 25,
                scaleY: 25,
            })
        }) // Hacky way to do this o_0
        return (
            <div>
                <canvas ref="canvas"/>
            </div>
        )
    }

    get layout() {
        return this.state.layout
    }

    new() {
        const layout = new Layout()
        layout.addSection(0, 0, 0, 0)
        layout.addSection(0, 1, 0, 10)
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