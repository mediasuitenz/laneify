'use strict';

var splitter = require('./lib/splitter')

var laneify = {
  split: function (way) {
    return splitter(way)
  }
}

module.exports = laneify
