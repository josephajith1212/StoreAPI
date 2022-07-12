const products = require('./products.json')
let newList = products.map(item => {
    return {name: item.name, price: item.price}
})
console.log(newList)