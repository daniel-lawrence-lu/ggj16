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
