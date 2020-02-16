export const flattenArr = (arr) => {
    // 循环归并
    return arr.reduce((map, item) => {
        map[item.id] = item
        return map
    }, {})
}

export const objToArr = (obj) =>{
    return Object.keys(obj).map(key => obj[key])
}

export const getParentNode = (node, parentClassName) => {
    let current = node 
    // console.log(node, parentClassName)
    while(current !== null) {
        if(current.classList.contains(parentClassName)) {
            return current
        }
        current = current.parentNode
    }
    return false
}

export const timeampToString = (timestamp) =>{
    const date = new Date(timestamp)
    return date.toLocaleDateString() +' '+ date.toLocaleTimeString()
}