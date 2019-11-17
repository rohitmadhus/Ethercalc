
'use strict';

var React    = require('react')
var TabPanel = require('./src')

var App = React.createClass({

    getInitialState: function(){
        return {
        }
    },

    handleChange: function(index){
        this.setState({
            activeIndex: index
        })
    },

    render: function() {
        return <TabPanel
            enableScroll={true}
            scrollerStyle={{background: 'gray'}}
            style={{width: '100%', border: '1px solid blue'}}
            activeIndex={this.state.activeIndex}
            onChange={this.handleChange}
            titleStyle={{padding: 10, border: '1px solid red'}}
            defaultStyle={{padding: 10}}
            stripStyle={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
            }}
        >
            <div title="One">first</div>
            <div title="Two">second</div>
            <div title="Three">third</div>
            <div title="Four">four</div>
            <div title="Five">five</div>
            <div title="Six">six</div>
            <div title="Seven">sevenup</div>
        </TabPanel>
    }
})

React.render((
    <App />
), document.getElementById('content'))