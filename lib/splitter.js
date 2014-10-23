'use strict';

var clone = require('clone')
var merge = require('object-merge')
var geoTools = require('./geoTools')

var DEFAULTS = {
  lanes: 2,
  laneOffset: 0.0001
}

function createLaneSegment(centerline, offset, left) {
  if (left) {
    offset = -offset
  }

  var normal = geoTools.unitNormal(centerline)

  var point1 = geoTools.translate(centerline.p1, normal, offset)
  var point2 = geoTools.translate(centerline.p2, normal, offset)

  return geoTools.createLine(point1, point2)
}

function sanitizeLaneData(lanes) {
  var whitelist = ['highway', 'name', 'lanes']
  lanes.forEach(function (lane) {
    delete lane.id

    Object.keys(lane.properties).forEach(function (property) {
      if (whitelist.indexOf(property) < 0) {
        delete lane.properties[property]
      }
    })
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

      lastSegment = createLaneSegment(centerline, laneOffset, lane.properties.lane === 'left')

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
  sanitizeLaneData(lanes)
  var leftLane = lanes[0]
  var rightLane = lanes[1]
  leftLane.properties.lane = 'with';
  rightLane.properties.lane = 'against';

  createLaneGeometry(leftLane, laneOffset)
  createLaneGeometry(rightLane, laneOffset)

  return [leftLane, rightLane]
}

function isOneWay(road) {
  return road.properties.oneway && road.properties.oneway === 'yes'
}

function isRoad(feature) {
  var highway = feature.properties.highway
  var roadTypeMatch = /residential/.test(highway) || /primary/.test(highway)

  return feature.geometry.type === 'LineString' && highway && roadTypeMatch
}

module.exports = function splitter(road, options) {
  options = merge(DEFAULTS, options)

  var featureCollection = {
    type: 'FeatureCollection',
    features: []
  }

  if (isOneWay(road)) {
    featureCollection.features.push(road)
  } else {
    featureCollection.features = createLanes(road, options.laneOffset)
  }

  return featureCollection;
}
