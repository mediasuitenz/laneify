Laneify
=======

## Create offset GeoJSON LineString features (lanes) based on an OSM way (road)

### Installation
`npm install laneify`

### Example usage
Given some Open Street Maps GeoJSON way feature:
```js
var offset = 1 // The geographical distance to offset by (in WGS84 coordinate space)
var road = require('./validGeoJSONWay.json')

var lanes = laneify.split(road, offset)
```

### Output
Returns a GeoJSON feature collection with either 2 features representing the left and right sides of the road, or one feature if the road is a one-way road. One-way roads do not get their coordinates offset.

## TODO
- Allow users to specify number of lanes to split into
