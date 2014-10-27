'use strict';

var geoTools = require('./geoTools')

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

module.exports = translateSegment