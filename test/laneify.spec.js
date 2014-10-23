'use strict';

require('chai').should()
var laneify = require('../index')

var way = {
    type: 'Feature',
    id: 'way/23150691',
    properties: {
        highway: 'residential',
    },
    geometry: {
        type: 'LineString',
        coordinates: [
            [
                172.6788568,
                -43.5289081
            ],
            [
                172.6787559,
                -43.5288417
            ],
            [
                172.6748169,
                -43.5262494
            ]
        ]
    }
}

describe('Laneify', function () {
  describe('splitting a way into two lanes', function () {
    var validWay, result

    Given('a way', function () {
      validWay = way
    })
    When('the split function is called', function () {
      result = laneify.split(way)
    })
    Then('the result should have 2 features', function () {
      result.length.should.equal(2)
    })
  })
})
