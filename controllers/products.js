const {query} = require('express')
const Product = require('../models/product')
const {search} = require('../routes/products')

const getAllProductsStatic = async (req, res) => {
    const productList = await Product.find({price: {'$gt': 130}})
    res.status(200).json({productList})
}

const getAllProducts = async (req, res) => {
    const queryObj = {}
    const {featured, company, name, sort, fields, numericFilters} = req.query
    if (featured) queryObj.featured === 'true' ? true : false
    if (company) queryObj.company = company
    if (name) queryObj.name = {$regex: name, $options: 'i'}
    if (numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            '=': '$eq',
        }
        const regEx = /\b(<|<=|=|>|>=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        const numericOptions = ['price','rating']
        filters = filters.split(',').map(item => {
            const [field, operator, value] = item.split('-')
            if (numericOptions.includes(field)) queryObj[field] = {[operator]: Number(value)}
        })
        console.log(queryObj)
    }
    let result = Product.find(queryObj)
    if (sort) {
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }
    if (fields) {
        result = result.select(fields.split(',').join(' '))
    }
    
    const page = Number(req.query['page']) || 1
    const limit = Number(req.query['limit']) || 10
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)
    const products = await result
    res.status(200).json({products, numHits: products.length})
}

module.exports = {
    getAllProductsStatic,
    getAllProducts
}