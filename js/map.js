function Map(map) {
  PIXI.Container.call(this);

  this.map = map;
  this.renderViewport = function(x, y, width, height) {
    this.removeChildren();
    for (var r = Math.floor(y/Map.tileSize);
             r < Math.min(this.map.length, Math.floor((y + height)/Map.tileSize)+1);
             r++) {
      for (var c = Math.floor(x/Map.tileSize);
               c < Math.min(this.map[0].length, Math.floor((x + width)/Map.tileSize)+1);
               c++) {
        var sprite = PIXI.Sprite.fromImage(Map.tiles[this.map[r][c]]);
        sprite.x = c * Map.tileSize - x;
        sprite.y = r * Map.tileSize - y;
        sprite.width = Map.tileSize;
        sprite.height = Map.tileSize;
        this.addChild(sprite);
      }
    }
  }
  this.isImpassable = function(x, y) {
    var r = Math.floor(y/Map.tileSize);
    var c = Math.floor(x/Map.tileSize);
    return r < 0 || c < 0 || r >= this.map.length || c >= this.map[0].length ||
           Map.impassable[this.map[r][c]];
  }
  this.getWidth = function() {
      return this.map[0].length * Map.tileSize;
  }
  this.getHeight = function() {
      return this.map.length * Map.tileSize;
  }
}
Map.prototype = Object.create(PIXI.Container.prototype);
Map.prototype.constructor = Map;

Map.tileSize = 50;
Map.tiles = [
  "../assets/img/ground.png",
  "../assets/img/wall.png",
];
Map.impassable = [
  false,
  true,
];
