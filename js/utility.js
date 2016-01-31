var STAGE_WIDTH = 720;
var STAGE_HEIGHT = 480;
var UI_HEIGHT = 120;
var APP_WIDTH = STAGE_WIDTH;
var APP_HEIGHT = STAGE_HEIGHT + UI_HEIGHT;

var TILE_SIZE_DEFAULT = 64;
var TILE_SIZE = 64;
var ASSET_TILE_SIZE = 64;

function dist2(x1, y1, x2, y2) {
  return (x1 -= x2) * x1 + (y1 -= y2) * y1;
}

function sign(x) {
  return x ? x < 0 ? -1 : 1 : 0;
}
function range(left, right_excl) {
  var ret = [];
  for (var i=left; i < right_excl; i++) {
    ret.push(i);
  }
  return ret;
}

function repeatEach(arr, x) {
  var ret = [];
  for (var i=0; i < arr.length; i++) {
    for (var j=0; j < x; j++) {
      ret.push(arr[i]);
    }
  }
  return ret;
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}
