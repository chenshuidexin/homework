import { addEvent } from './event'
function render(vdom, parentDOM) {
    let dom = createDOM(vdom)
    parentDOM.appendChild(dom)
}

export function createDOM(vdom) {
    if (typeof vdom === 'string' || typeof vdom === 'number') {
        return document.createTextNode(vdom)
    }
    let { type, props, ref } = vdom
    let dom
    if (typeof type === 'function') {
        return type.prototype.isReactComponent ? updateClassCompoenent(vdom) : updateFunctionCompoenent(vdom)
    } else {
        dom = document.createElement(type)
    }
    updateProps(dom, props)
    if (typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if (typeof props.children === 'object' && props.children.type) {
        render(props.children, dom)
    } else if (Array.isArray(props.children)) {
        reconcilenChildren(props.children, dom)
    } else {
        dom.textContent = props.children ? props.children.toString() : ''
    }
    if (ref) {
        ref.current = dom
    }
    return dom
}

function updateClassCompoenent(vdom) {
    let { type, props, ref } = vdom
    let classInstance = new type(props)
    if (ref) {
        ref.current = classInstance
    }
    classInstance.componentWillMount && classInstance.componentWillMount()
    let renderVdom = classInstance.render()
    classInstance.oldVdom = renderVdom
    classInstance.oldVdom.classInstance = classInstance
    let dom = createDOM(renderVdom)
    classInstance.dom = renderVdom.dom = dom
    classInstance.componentDidMount && classInstance.componentDidMount()
    return dom
}

function updateFunctionCompoenent(vdom) {
    let { type, props } = vdom
    let renderVdom = type(props)
    return createDOM(renderVdom)
}

function reconcilenChildren(children, dom) {
    for (let i = 0; i < children.length; i++) {
        render(children[i], dom)
    }
}

function updateProps(dom, props) {
    for (let key in props) {
        if (key === 'children') {
            continue
        } else if (key === 'style') {
            let style = props[key]
            for (let attr in style) {
                dom.style[attr] = style[attr]
            }
        } else if (key.startsWith('on')) {
            addEvent(dom, key.toLocaleLowerCase(), props[key])
        } else {
            dom[key] = props[key]
        }
    }
}
export function compare(oldVdom, newVdom) {
    //如果类型一样的,要进行深度对比
    if (oldVdom.type === newVdom.type) {
        //可以复用老DOM,不需要新创建DOM了
        newVdom.dom = oldVdom.dom
        newVdom.classInstance = oldVdom.classInstance
        if (typeof oldVdom.type === 'function') {
            let instance = oldVdom.classInstance
            instance.componentWillReceiveProps && instance.componentWillReceiveProps(newVdom.props)
            instance.$updater.emitUpdate(newVdom.props)
        } else {
            let newChildren = newVdom.props.children
            let oldChildren = oldVdom.props.children
            updateProps(newVdom.dom, newVdom.props)
            newChildren.forEach((e, index) => {
                compare(e, oldChildren[index])
            })
        }
        //1.用新的属性对象更新老的DOM的属性
        //2.深度比较儿子们,进行一一对比
    } else if ((oldVdom == null && newVdom) || (oldVdom && newVdom && oldVdom.type !== newVdom.type)) {
        let currentDOM = oldVdom.dom;
        let newDOM = createDOM(newVdom);
        newVdom.dom = newDOM;
        currentDOM.parentNode.replaceChild(newDOM, currentDOM);
        oldVdom.classInstance.componentWillUnmount && oldVdom.classInstance.componentWillUnmount()
        return newVdom;
    } else {
        let dom = createDOM(newVdom);
        return dom;
    }
}
export default {
    render
}