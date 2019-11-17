'use strict';

var React     = require('react')
var copy      = require('copy-utils').copy
var copyList  = require('copy-utils').copyList
var copyKeys  = require('copy-utils').copyKeys
var copyExceptKeys  = require('copy-utils').copyExceptKeys
var Strip     = require('./Strip')
var Container = require('./Container')

var StripFactory     = React.createFactory(Strip)
var ContainerFactory = React.createFactory(Container)

var BASE_CLASS_NAME = require('./baseClassName')

function emptyFn(){}

var TabPanel = React.createClass({

    propTypes: {
        activeIndex         : React.PropTypes.number,

        //for panels
        activeStyle         : React.PropTypes.object,
        activeClassName     : React.PropTypes.string,
        defaultStyle        : React.PropTypes.object,
        defaultClassName    : React.PropTypes.string,

        //for titles
        titleStyle          : React.PropTypes.object,
        titleClassName      : React.PropTypes.string,
        activeTitleStyle    : React.PropTypes.object,
        activeTitleClassName: React.PropTypes.string,

        onChange            : React.PropTypes.func,

        stripListStyle  : React.PropTypes.object,
        stripFactory    : React.PropTypes.func,
        containerFactory: React.PropTypes.func,

        //specify 'bottom' if you want to render the strip after the container
        tabVerticalPosition   : React.PropTypes.string
    },

    getDefaultProps: function(){
        return {
            activeIndex: 0,

            //for panels
            activeStyle: {},
            activeClassName: 'active',
            defaultStyle: {},
            defaultClassName: '',

            //for titles
            titleStyle: {},
            titleClassName: '',
            activeTitleStyle: {},
            activeTitleClassName: 'active',

            tabVerticalPosition: 'top'
        }
    },


    render: function(){

        var props = copy(this.props)
        props.children = props.children || []

        var activeIndex = props.activeIndex || 0
        props.activeIndex = Math.min(activeIndex, props.children.length - 1)

        props.className = props.className || ''
        props.className += ' ' + BASE_CLASS_NAME

        var StripComponent     = this.renderStrip(props)
        var ContainerComponent = this.renderContainer(props)

        var Content = props.tabVerticalPosition == 'bottom'?
                            [ContainerComponent, StripComponent]:
                            [StripComponent, ContainerComponent]

        var divProps = {
            className: props.className,
            style    : props.style
        }

        return (
            <div {...divProps} >
                {Content}
            </div>
        )
    },

    renderContainer: function(props) {
        var containerProps = copyList(props, [
                'activeIndex',
                'activeClassName',
                'activeStyle',
                'defaultStyle',
                'defaultClassName',
                'hiddenStyle',
                'children'
            ])

        containerProps.key = 'container'

        if (props.containerFactory){
            return props.containerFactory(containerProps, ContainerFactory)
        }

        return ContainerFactory(containerProps)
    },

    renderStrip: function(props){
        var stripProps = copyExceptKeys(props, {},{
            stripStyle: 1,
            activeTitleStyle: 1,
            activeTitleClassName: 1
        })

        copyKeys(props, stripProps, {
            stripStyle          : 'style',
            activeTitleStyle    : 'activeStyle',
            activeTitleClassName: 'activeClassName'
        })

        stripProps.key      = 'strip'
        stripProps.onChange = this.handleChange || emptyFn

        if (props.stripFactory){
            return props.stripFactory(stripProps, StripFactory)
        }

        return StripFactory(stripProps)
    },

    handleChange: function(index){
        this.props.onChange(index)
    }
})

TabPanel.Strip     = Strip
TabPanel.Container = Container

module.exports = TabPanel