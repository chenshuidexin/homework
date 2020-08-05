let reg = /^<([^>]+)>(.+)<\/([^>]+)>$/;
function tokenizer(input) {
    let tokens = {}
    function next(input, obj, parent) {
        let matchReg = input.match(reg)
        if (matchReg) {
            
            obj.children = []
            let propsArray = ''
            if (matchReg.length > 4) {
                if (matchReg[1]) {
                    parent.children.unshift(matchReg[1])
                }
                if (matchReg[5]) {
                    parent.children.push(matchReg[5])
                }
                obj.tagName = matchReg[4]
                obj.children.push(matchReg[3])
                propsArray = matchReg[2].trim().slice(4).match(/\s*((\w*)\="(\w*)")\s*/g)
            } else {
                obj.tagName = matchReg[3]
                obj.children.push(matchReg[2])
                propsArray = matchReg[1].trim().slice(obj.tagName.length).match(/\s*((\w*)\="(\w*)")\s*/g)
            }
            
            obj.props = []
            propsArray && propsArray.forEach(e => {
                let name = e.split('=')[0].trim()
                let val = e.split('=')[1].trim().replace('"', '')
                obj.props.push({name: name, value: val})
            })
            reg = /(.*)<([^>]+)>(.+)<\/([^>]+)>(.*)/
            obj.children.forEach((e, index) => {
                if (e.match(reg)) {
                    next(e, obj.children[index] ={}, obj)
                }
            })
        }
    }
    next(input, tokens)

    function next2(obj) {
        let strProp = ''
        obj.props.forEach(e => {
            strProp+= `${e.name}:"${e.value}"`
        })
        let strChild = []
        obj.children.forEach(e => {
            if(!e.tagName) {
                strChild.push(e)
            } else {
                strChild.push(next2(e))
            }
        })
        return `React.createElement("${obj.tagName}", {${strProp}}, ${strChild.join(',')})`
    }
    return next2(tokens)
}

console.log(tokenizer('<h1 id="title"><span>hello</span>world</h1>'))