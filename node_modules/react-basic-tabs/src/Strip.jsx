'use strict';

var React  = require('react')
var copy   = require('copy-utils').copy
var F      = require('functionally')
var buffer = F.buffer

var BASE_CLASS_NAME = require('./baseClassName')

function stop(event){
    event.preventDefault()
    event.stopPropagation()
}

var LIST_ITEM_STYLE = {
    display: 'inline-block'
}

var LIST_STYLE = {
    margin   : 0,
    padding  : 0,
    listStyle: 'none',
    position : 'relative',
    display  : 'inline-block'
}

var SCROLLER_STYLE = {
    top       : 0,
    position  : 'absolute',
    // display   : 'inline-block',
    height    : '100%',
    cursor    : 'pointer'
}

var Scroller = React.createClass({

    display: 'Scroller',

    getDefaultProps: function(){
        return {
            width: 5
        }
    },

    render: function(){
        var props = this.props
        var side  = this.props.side

        props.className = props.className || ''
        props.className += ' ' + BASE_CLASS_NAME + '-scroller ' + side

        if (props.active && props.visible){
            props.className += ' active'
        }

        var scrollerStyle = copy(SCROLLER_STYLE)

        props.style = copy(props.style, scrollerStyle)
        props.style.width = props.style.width || props.width

        props.style[side] = 0

        if (!props.visible){
            props.style.display = 'none'
        }

        return props.factory?
                    props.factory(props, side):
                    <div {...props}/>
    }
})

var ScrollerFactory = React.createFactory(Scroller)

module.exports = React.createClass({

    display: 'TabPanel.Strip',

    propTypes: {
        activeIndex    : React.PropTypes.number,
        activeStyle    : React.PropTypes.object,
        activeClassName: React.PropTypes.string,

        titleStyle    : React.PropTypes.object,
        titleClassName: React.PropTypes.string,

        anchorStyle   : React.PropTypes.object,
        scrollerStyle : React.PropTypes.object,
        scrollerProps : React.PropTypes.object,
        scrollerWidth : React.PropTypes.number,

        scrollStep    : React.PropTypes.number,
        scrollSpeed   : React.PropTypes.number

        //each item in the TabPanel can also specify a titleStyle
        //and a titleClassName, which are added to the values in props
    },

    getInitialState: function(){
        return {
            adjustScroll: true,
            scrollPos   : 0
        }
    },

    componentWillUnmount: function(){
        if (this.props.enableScroll){
            window.removeEventListener('resize', this.onResizeListener)
        }
    },

    componentDidMount: function(){
        if (this.props.enableScroll){
            setTimeout(function(){
                this.adjustScroll()

                window.addEventListener('resize', this.onResizeListener = buffer(this.onWindowResize, this.props.onWindowResizeBuffer, this))
            }.bind(this), 0)
        }
    },

    componentDidUpdate: function(){
        this.props.enableScroll && this.adjustScroll()
    },

    onWindowResize: function(){
        this.adjustScroll()
        this.doScroll(0)
    },

    adjustScroll: function(){
        if (!this.props.enableScroll){
            return
        }

        if (!this.state.adjustScroll){
            this.state.adjustScroll = true
            return
        }

        var availableWidth = this.getAvailableStripWidth()
        var listWidth      = this.getCurrentListWidth()

        var state = {
            adjustScroll  : false,
            hasLeftScroll : false,
            hasRightScroll: false
        }

        if (listWidth > availableWidth){
            state.maxScrollPos = listWidth - availableWidth
            state.hasLeftScroll  = this.state.scrollPos !== 0
            state.hasRightScroll = this.state.scrollPos != state.maxScrollPos
        } else {
            state.maxScrollPos = 0
            state.scrollPos    = 0
        }

        this.setState(state)
    },

    getCurrentListWidth: function(){
        return this.refs.list.getDOMNode().offsetWidth
    },

    getAvailableStripWidth: function(){
        var dom     = this.getDOMNode()
        var domComputedStyle = window.getComputedStyle(dom)

        var leftPadding  = parseInt(domComputedStyle.left, 10)
        var rightPadding = parseInt(domComputedStyle.right, 10)

        if (isNaN(leftPadding)){
            leftPadding = 0
        }
        if (isNaN(rightPadding)){
            rightPadding = 0
        }

        return dom.clientWidth - leftPadding - rightPadding
    },

    handleScrollLeft: function(event){
        event.preventDefault()
        this.handleScroll(-1)
    },

    handleScrollRight: function(event){
        event.preventDefault()
        this.handleScroll(1)
    },

    handleScrollLeftMax: function(event){
        stop(event)
        this.handleScrollMax(-1)
    },

    handleScrollRightMax: function(event){
        stop(event)
        this.handleScrollMax(1)
    },

    handleScrollMax: function(direction){
        var maxPos = direction == -1?
                        0:
                        this.state.maxScrollPos

        this.setScrollPosition(maxPos)
    },

    handleScroll: function(direction /*1 to right, -1 to left*/){
        var mouseUpListener = function(){
            this.stopScroll()
            window.removeEventListener('mouseup', mouseUpListener)
        }.bind(this)

        window.addEventListener('mouseup', mouseUpListener)

        this.scrollInterval = setInterval(this.doScroll.bind(this, direction), this.props.scrollSpeed)
    },

    doScroll: function(direction){
        this.setState({
            scrollDirection: direction
        })

        var newScrollPos = this.state.scrollPos + direction * this.props.scrollStep

        this.setScrollPosition(newScrollPos)
    },

    setScrollPosition: function(scrollPos){
        if (scrollPos > this.state.maxScrollPos){
            scrollPos = this.state.maxScrollPos
        }

        if (scrollPos < 0){
            scrollPos = 0
        }

        this.setState({
            scrollPos: scrollPos,
            scrolling : true
        })
    },

    stopScroll: function(){
        clearInterval(this.scrollInterval)

        this.setState({
            scrolling: false
        })
    },

    getDefaultProps: function(){
        return {
            onWindowResizeBuffer: 50,

            scrollStep          : 5,
            scrollSpeed         : 50,
            scrollerWidth       : 8,
            scrollerProps       : {},

            enableScroll: false,
            hasLeftScroll: false,
            hasRightScroll: false,
            activeClassName: '',
            activeStyle: {},

            anchorStyle: {
                color         : 'inherit',
                textDecoration: 'inherit'
            }
        }
    },

    renderTitle: F.curry(function(parentProps, classNameArray, titleStyle, child, index){
        var anchorStyle     = parentProps.anchorStyle
        var activeStyle     = parentProps.activeStyle
        var activeClassName = parentProps.activeClassName
        var activeIndex     = parentProps.activeIndex || 0

        var childProps = child.props
        var title      = childProps.tabTitle || childProps.title

        titleStyle = copy(titleStyle)

        //ALLOW each item to also specify a titleStyle
        copy(childProps.titleStyle, titleStyle)

        //and a titleClassName
        var titleClassName = classNameArray.concat(childProps.titleClassName || '')

        if (index == activeIndex){
            copy(activeStyle, titleStyle)
            titleClassName.push(activeClassName || '')
        }

        return (
            <li
                key       ={index}
                onClick   ={this.handleChange.bind(this, index)}
                style     ={titleStyle}
                className ={titleClassName.join(' ')}
            >
                <a href="#" style={anchorStyle}>{title}</a>
            </li>
        )
    }),

    render: function(){
        var props = copy(this.props)

        var titleStyle = copy(LIST_ITEM_STYLE)
        copy(props.titleStyle, titleStyle)

        var titleClassName = [props.titleClassName || '', BASE_CLASS_NAME + '-item-title']

        var nodes = React.Children.map(props.children, this.renderTitle(props, titleClassName, titleStyle), this)

        props.className = props.className || ''
        props.className += ' ' + BASE_CLASS_NAME + '-strip'

        props.style          = props.style || {}
        props.style.position = 'relative'

        var listStyle = copy(LIST_STYLE)

        if (this.state.scrollPos){
            listStyle.left = -this.state.scrollPos
        }

        var scrollerLeft = this.renderScroller(-1)
        var scrollerRight= this.renderScroller(1)

        return (
            <nav {...props}>
                <ul ref="list" style={listStyle}>
                {nodes}
                </ul>
                {scrollerLeft}
                {scrollerRight}
            </nav>
        )
    },

    handleChange: function(index, event){
        event.preventDefault()
        this.props.onChange(index)
    },

    renderScroller: function(direction){

        if (!this.props.enableScroll){
            return
        }

        var onDoubleClick = direction == -1?
                                this.handleScrollLeftMax:
                                this.handleScrollRightMax

        var onMouseDown = direction == -1?
                            this.handleScrollLeft:
                            this.handleScrollRight

        var side    = direction == -1? 'left': 'right'
        var visible = direction == -1?
                            this.state.hasLeftScroll:
                            this.state.hasRightScroll

        return ScrollerFactory(copy(this.props.scrollerProps, {
            factory      : this.props.scrollerFactory,
            active       : this.state.scrollDirection==direction && this.state.scrolling,
            onDoubleClick: onDoubleClick,
            onMouseDown  : onMouseDown,
            style        : this.props.scrollerStyle,
            side         : side,
            width        : this.props.scrollerWidth,
            visible      : visible
        }))
    }
})
