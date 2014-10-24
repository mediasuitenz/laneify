'use strict';

var clone = require('clone')
var catchError = require('catch-error')
require('chai').should()
var context = describe

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
  describe('splitting a road into two lanes', function () {
    context('with a valid way supplied', function () {
      var validWay, result

      Given('a way', function () {
        validWay = way
      })
      When('the split function is called', function () {
        result = laneify.split(way)
      })
      Then('the result should be a GeoJSON feature collection', function () {
        result.type.should.equal('FeatureCollection')
      })
      And('the result should have 2 features', function () {
        result.features.length.should.equal(2)
      })
    })

    context('handling a one way road', function () {
      var oneWay, result

      Given('a one way road', function () {
        oneWay = clone(way)
        oneWay.properties.oneway = 'yes'
      })
      When('the split function is called', function () {
        result = laneify.split(oneWay)
      })
      Then('the result should be a GeoJSON feature collection', function () {
        result.type.should.equal('FeatureCollection')
      })
      And('the result should have 1 feature', function () {
        result.features.length.should.equal(1)
      })
    })

    context('with an invalid way supplied', function () {
      var invalidWay, error

      Given('an invalid way', function () {
        invalidWay = clone(way)
        invalidWay.geometry.type = 'Point'
        delete invalidWay.properties.highway
      })
      When('the split function is called', function () {
        error = catchError({ func: laneify.split, args: [invalidWay] })
      })
      Then('it should throw an error', function () {
        error.should.be.an.instanceof(Error)
      })
    })

    context('with no way supplied', function () {
      var invalidWay, error

      Given('an invalid way', function () {
        invalidWay = undefined
      })
      When('the split function is called', function () {
        error = catchError({ func: laneify.split, args: [invalidWay] })
      })
      Then('it should throw an error', function () {
        error.should.be.an.instanceof(Error)
      })
    })
  })
})
