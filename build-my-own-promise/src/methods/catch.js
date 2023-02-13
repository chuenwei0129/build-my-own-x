const Promise = require('../promise')

Promise.prototype.catch = function (callback) {
  return this.then(undefined, callback)
}

module.exports = Promise
