'use strict';

var clone = require('clone')
var randNum = require('random-number')

function isRoad(feature) {
  var highway = feature.properties.highway
  var roadTypeMatch = /residential/.test(highway) || /primary/.test(highway)

  return feature.geometry.type === 'LineString' && highway && roadTypeMatch
}

module.exports = function (road) {

  var rand = randNum.generator({
      min:  10000000000
    , max:  99999999999
    , integer: true
  })

  var laneOffset = 0.0001

  var Point = function (x, y) {
    return {
      x: x,
      y: y
    }
  }

  var Line = function (point1, point2) {
    return {
      p1: point1,
      p2: point2
    }
  }

  function getVector(line) {
    var p1 = line.p1,
        p2 = line.p2

    return new Point((p1.x - p2.x), (p1.y - p2.y))
  }

  function getLength(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
  }

  function normalise(vector) {
    var length = getLength(vector)

    return new Point(vector.x/length, vector.y/length)
  }

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  function rotateVector(vec, degrees) {
    var radians = degreesToRadians(degrees)
    var sin = Math.sin(radians)
    var cos = Math.cos(radians)

    // Apply transform
    var newX = vec.x * cos - vec.y * sin
    var newY = vec.x * sin + vec.y * cos

    return new Point(newX, newY)
  }

  function getUnitNormal(line) {
    return normalise(rotateVector(getVector(line), 90))
  }

  function add(point1, point2) {
    return new Point(point1.x + point2.x, point1.y + point2.y)
  }

  function multiply(point, scalar) {
    return new Point(point.x * scalar, point.y * scalar)
  }

  function translatePoint(point, unitVector, distance) {
    return add(point, multiply(unitVector, distance))
  }

  function createLaneSegment(centerline, offset, left) {
    if (left) {
      offset = -offset
    }

    var normal = getUnitNormal(centerline)

    var point1 = translatePoint(centerline.p1, normal, offset)
    var point2 = translatePoint(centerline.p2, normal, offset)

    return new Line(point1, point2)
  }

  function setLaneData(lanes) {
    lanes.forEach(function (lane) {
      lane.id = 'way/' + rand()
      lane.properties.id = lane.id
      delete lane.properties.uid
      delete lane.properties.user
    })
  }

  function createLaneGeometry(lane) {
    var lastSegment
    var laneCoords = []
    var allNodes = lane.geometry.coordinates

    allNodes.forEach(function (point1Array, index) {
      if (index !== allNodes.length - 1) {
        var point2Array = allNodes[index + 1]
        var p1 = new Point(point1Array[0], point1Array[1])
        var p2 = new Point(point2Array[0], point2Array[1])
        var centerline = new Line(p1, p2)

        lastSegment = createLaneSegment(centerline, laneOffset, lane.properties.lane === 'left')

        laneCoords.push([lastSegment.p1.x, lastSegment.p1.y])
      } else {
        var lastPoint = lastSegment.p2

        laneCoords.push([lastPoint.x, lastPoint.y])
      }
    })

    lane.geometry.coordinates = laneCoords
  }

  function createLanes(road) {

    var lanes = [road, clone(road, true)]
    setLaneData(lanes)
    var leftLane = lanes[0]
    var rightLane = lanes[1]
    leftLane.properties.lane = 'left';
    rightLane.properties.lane = 'right';

    createLaneGeometry(leftLane)
    createLaneGeometry(rightLane)

    return [leftLane, rightLane]
  }

  function isOneWay(road) {
    return road.properties.oneway && road.properties.oneway === 'yes'
  }

  var featureCollection = {
    type: 'FeatureCollection',
    features: []
  }

  if (isOneWay(road)) {
    featureCollection.features.push(road)
  } else {
    featureCollection.features = createLanes(road)
  }

  return featureCollection;
}
