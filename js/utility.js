var STAGE_WIDTH = 720;
var STAGE_HEIGHT = 480;
var UI_HEIGHT = 120;
var APP_WIDTH = STAGE_WIDTH;
var APP_HEIGHT = STAGE_HEIGHT + UI_HEIGHT;

var TILE_SIZE = 64;
var ASSET_TILE_SIZE = 64;

function dist2(x1, y1, x2, y2) {
  return (x1 -= x2) * x1 + (y1 -= y2) * y1;
}

function sign(x) {
  return x ? x < 0 ? -1 : 1 : 0;
}
