'use strict';

var geoTools = require('../lib/geoTools')
require('chai').should()
var context = describe

var translateSegment = require('../lib/translateSegment')

describe('translateSegment', function () {
  var line, offset
  Given('a vertical line', function () {
    line = geoTools.createLine(
      geoTools.createPoint(0, 0),
      geoTools.createPoint(0, 1)
    )
  })
  And('an offset', function () {
    offset = 1
  })

  context('`with` the line', function () {
    var result

    When('the line is translated', function () {
      result = translateSegment(line, offset, true)
    })
    Then('the resultant line should be translated correctly', function () {
      result.p1.x.should.equal(-1)
      result.p2.x.should.equal(-1)
      result.p1.y.should.equal(line.p1.y)
      result.p2.y.should.equal(line.p2.y)
    })
  })

  context('`against` the line', function () {
    var result

    When('the line is translated', function () {
      result = translateSegment(line, offset, false)
    })
    Then('the resultant line should be translated correctly', function () {
      result.p1.x.should.equal(1)
      result.p2.x.should.equal(1)
      result.p1.y.should.equal(line.p1.y)
      result.p2.y.should.equal(line.p2.y)
    })
  })
})
