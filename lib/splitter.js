'use strict';

var clone = require('clone')
var merge = require('object-merge')
var assert = require('assert')
var geoTools = require('./geoTools')
var translateSegment = require('./translateSegment')

var DEFAULTS = {
  laneOffset: 0.0001
}

/**
 * Strips out the unneeded properties
 * @param  {object} road GeoJSON object to sanitize
 * @return {object}      Sanitized road
 */
function sanitizeRoadData(road) {
  var whitelist = ['highway', 'name', 'lanes', 'oneway']
  delete road.id

  Object.keys(road.properties).forEach(function (property) {
    if (whitelist.indexOf(property) < 0) {
      delete road.properties[property]
    }
  })
}

/**
 * Modifies the coordinates of a lane to be the translated (offset) values
 * @param  {object} lane       OSM GeoJSON LineString
 * @param  {Number} laneOffset distance to offset by
 */
function createLaneGeometry(lane, laneOffset) {
  var lastSegment
  var laneCoords = []
  var allNodes = lane.geometry.coordinates

  allNodes.forEach(function (point1Array, index) {
    if (index !== allNodes.length - 1) {
      var point2Array = allNodes[index + 1]
      var p1 = geoTools.createPoint(point1Array[0], point1Array[1])
      var p2 = geoTools.createPoint(point2Array[0], point2Array[1])
      var centerline = geoTools.createLine(p1, p2)

      lastSegment = translateSegment(centerline, laneOffset, lane.properties.direction === 'with')

      laneCoords.push([lastSegment.p1.x, lastSegment.p1.y])
    } else {
      var lastPoint = lastSegment.p2

      laneCoords.push([lastPoint.x, lastPoint.y])
    }
  })
  lane.geometry.coordinates = laneCoords
}

/**
 * Clones the given OSM GeoJSON way into 2 and offsets their geometries
 * @param  {object} road        OSM GeoJSON LineString
 * @param  {Number} laneOffset  distance to offset by
 * @return {array}              the 2 offset GeoJSON objects
 */
function createLanes(road, laneOffset) {
  var lanes = [road, clone(road)]
  var leftLane = lanes[0]
  var rightLane = lanes[1]
  leftLane.properties.direction = 'with';
  rightLane.properties.direction = 'against';

  createLaneGeometry(leftLane, laneOffset)
  createLaneGeometry(rightLane, laneOffset)

  return [leftLane, rightLane]
}

/**
 * Check if this is a one way road (by OSM's standard)
 * @param  {object} road  OSM GeoJSON LineString
 * @return {Boolean}
 */
function isOneWay(road) {
  return !!road.properties.oneway && road.properties.oneway === 'yes'
}

/**
 * Check if this is a road we're interested in
 * @param  {object} road  OSM GeoJSON LineString
 * @return {Boolean}
 */
function isRoad(feature, types) {
  var validRoadTypes = new RegExp(types.join('|'))
  var highway = feature.properties.highway

  return highway && validRoadTypes.test(highway)
}

function isLineString(feature) {
  return feature.geometry.type === 'LineString'
}

module.exports = function splitter(road, options) {
  options = merge(DEFAULTS, options || {})

  assert(!!road, '`road` must be supplied (GeoJSON object)')
  assert(isLineString(road), '`road` must be a GeoJSON LineString')
  if (options.highwayTypes) {
    assert(isRoad(road, options.highwayTypes), '`road` supplied must be a LineString with valid `highway` property')
  }
  // Don't modify what we're given
  road = clone(road)

  var featureCollection = {
    type: 'FeatureCollection',
    features: []
  }

  sanitizeRoadData(road)

  if (isOneWay(road)) {
    featureCollection.features.push(road)
  } else {
    featureCollection.features = createLanes(road, options.laneOffset)
  }

  return featureCollection;
}
