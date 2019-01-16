'use strict'

const constants = require(__dirname + '/../constants')
const objectPath = require('object-path')

module.exports.buildError = (code, message) => {
  let errorObject = {
    success: false,
    error: {
      code
    }
  }

  if (message) {
    errorObject.error.message = message
  }

  return errorObject
}

module.exports.formatMetric = (metricName, value) => {
  const metric = objectPath.get(constants.metrics, metricName)

  if (!metric) return

  let output = value

  if (metric.transform) {
    output = metric.transform(output)
  }

  if (metric.unit) {
    output += metric.unit
  }

  return output
}

module.exports.padWithZeros = (input, length) => {
  let inputStr = input.toString()
  let lengthDiff = length - inputStr.length

  if (lengthDiff > 0) {
    return '0'.repeat(lengthDiff) + inputStr
  }

  return inputStr
}

const traverseObject = (obj, callback, path) => {
  path = path || []

  if ((typeof obj === 'object') && !(obj instanceof Array) && (obj !== null)) {
    Object.keys(obj).forEach(key => {
      traverseObject(obj[key], callback, path.concat(key))
    })
  } else {
    callback(obj, path)
  }
}

module.exports.traverseObject = traverseObject

module.exports.mergeObject = (base, newObj, length) => {
  traverseObject(newObj, (obj, path) => {
    let joinedPath = path.join('.')
    let baseValue = objectPath.get(base, joinedPath)

    if (typeof baseValue === 'undefined') {
      const emptyArray = Array.apply(null, {length: length - 1}).map(() => null)

      objectPath.set(base, joinedPath, emptyArray)

      baseValue = objectPath.get(base, joinedPath)
    }

    baseValue.push(obj)
  })
}
