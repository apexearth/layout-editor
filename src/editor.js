require('./editor.less')
const React = require('react')

class Editor extends React.Component {
    constructor(...args) {
        super(...args)
    }

    render() {
        return (
            <div>
                Test
            </div>
        )
    }

    static mount(element) {
        const ReactDOM = require('react-dom')
        ReactDOM.render(<Editor/>, element)
    }
}

module.exports = Editor

if (typeof window !== 'undefined') {
    window['layout-editor'] = Editor
}