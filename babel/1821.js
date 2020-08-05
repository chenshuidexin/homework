const babel = require('@babel/core')
const t = require('@babel/types')
const code = `<h1 id="title" idd='tips'><span name='hello'>hello</span>world</h1>`
// const code = `<h1 id="title" name='hello' >world</h1>`
// const code = `<h1 id="title"><span>hello</span>world</h1>`

function JSXElement(path) { // 转化为 react.cerateElement()
    const node = path.node || path
    let callee = t.memberExpression(t.identifier('React'), t.identifier('cerateElement'))
    let type
    let properties = []
    type = t.StringLiteral(node.openingElement.name.name)
    let attributes = node.openingElement.attributes
    attributes.forEach(attr => {
        properties.push(t.objectProperty(t.identifier(attr.name.name), attr.value))
    })
    let prop = properties.length ? t.ObjectExpression(properties):t.nullLiteral()
    let rest = []
    let children = node.children
    children.forEach(child => {
        if (child.type === 'JSXElement') {
            rest.push(JSXElement(child))
        } else if (child.type === 'JSXText') {
            rest.push(t.StringLiteral(child.value))
        }
    })
    let arguments1 = [type, prop].concat(rest)
    let nowNode = t.callExpression(callee, arguments1)
    if (path.replaceWith) {
        path.replaceWith && path.replaceWith(nowNode)
    } else {
        return nowNode
    }

}

function transForm(babel) {
    return {
        visitor: {
            JSXElement
        }
    }

}

const result = babel.transform(code, {
    presets: ["@babel/preset-react"],
    plugins: [transForm],
})

console.log('result.code', result.code)