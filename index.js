'use strict';

var splitter = require('./lib/splitter')

var laneify = {
  split: function (road, options) {
    return splitter(road, options)
  }
}

module.exports = laneify
