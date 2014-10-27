'use strict';

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

function add(point1, point2) {
  return new Point(point1.x + point2.x, point1.y + point2.y)
}

function multiply(point, scalar) {
  return new Point(point.x * scalar, point.y * scalar)
}

function getVector(line) {
  var p1 = line.p1,
      p2 = line.p2

  return new Point((p1.x - p2.x), (p1.y - p2.y))
}

function vectorLength(vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
}

function normalVector(vec) {
  var newX = -vec.y
  var newY = vec.x

  return new Point(newX, newY)
}

function normalise(vector) {
  var length = vectorLength(vector)

  return new Point(vector.x/length, vector.y/length)
}

var geoTools = {
  createLine: function getLine(p1, p2) {
    return new Line(p1, p2)
  },
  createPoint: function getPoint(x, y) {
    return new Point(x, y)
  },
  unitNormal: function getUnitNormal(line) {
    return normalise(normalVector(getVector(line)))
  },
  translate: function translatePoint(point, unitVector, distance) {
    return add(point, multiply(unitVector, distance))
  }
}

module.exports = geoTools
