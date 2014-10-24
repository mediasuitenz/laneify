'use strict';

var clone = require('clone')
var merge = require('object-merge')
var assert = require('assert')
var geoTools = require('./geoTools')

var DEFAULTS = {
  laneOffset: 0.0001
}

/**
 * Offsets a segment by a defined amount along the normal to the segment
 * @param  {Line} centerline    A coordinate pair to offset
 * @param  {Number} offset        Amount to offset the line by
 * @param  {boolean} withNodeOrder Whether the lane is the left or right side
 * @return {Line}               [description]
 */
function translateSegment(centerline, offset, withNodeOrder) {
  if (withNodeOrder) {
    offset = -offset
  }

  var normal = geoTools.unitNormal(centerline)

  var point1 = geoTools.translate(centerline.p1, normal, offset)
  var point2 = geoTools.translate(centerline.p2, normal, offset)

  return geoTools.createLine(point1, point2)
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

      lastSegment = translateSegment(centerline, laneOffset, lane.properties.lane === 'with')

      laneCoords.push([lastSegment.p1.x, lastSegment.p1.y])
    } else {
      var lastPoint = lastSegment.p2

      laneCoords.push([lastPoint.x, lastPoint.y])
    }
  })
  lane.geometry.coordinates = laneCoords
}

function createLanes(road, laneOffset) {
  var lanes = [road, clone(road, true)]
  var leftLane = lanes[0]
  var rightLane = lanes[1]
  leftLane.properties.lane = 'with';
  rightLane.properties.lane = 'against';

  createLaneGeometry(leftLane, laneOffset)
  createLaneGeometry(rightLane, laneOffset)

  return [leftLane, rightLane]
}

function isOneWay(road) {
  return !!road.properties.oneway && road.properties.oneway === 'yes'
}

function isRoad(feature) {
  var highway = feature.properties.highway
  var roadTypeMatch = /residential/.test(highway) || /primary/.test(highway)

  return feature.geometry.type === 'LineString' && highway && roadTypeMatch
}


module.exports = function splitter(road, options) {
  assert(!!road, '`road` must be supplied (GeoJSON object)')
  assert(isRoad(road), '`road` supplied must be a LineString with property highway one of `residential` or `primary`')

  options = merge(DEFAULTS, options || {})

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
