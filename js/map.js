function Map(map) {
  PIXI.Container.call(this);

  this.map = map;
  this.renderViewport = function(x, y, width, height, playerX, playerY) {
    this.removeChildren();
    var obstacleSegments = [];
    for (var r = Math.floor(y/Map.tileSize);
             r < Math.min(this.map.length, Math.floor((y + height)/Map.tileSize)+1);
             r++) {
      for (var c = Math.floor(x/Map.tileSize);
               c < Math.min(this.map[0].length, Math.floor((x + width)/Map.tileSize)+1);
               c++) {
        var sprite = PIXI.Sprite.fromImage(Map.tiles[this.map[r][c]]);
        var tileX = c * Map.tileSize - x, tileY = r * Map.tileSize - y;
        sprite.x = tileX;
        sprite.y = tileY;
        sprite.width = Map.tileSize;
        sprite.height = Map.tileSize;
        if(Map.impassable[this.map[r][c]]) {
            if(playerX <= tileX) {
                obstacleSegments.push([
                        [tileX, tileY],
                        [tileX, tileY + Map.tileSize]
                ]);
            } else if(playerX >= tileX + Map.tileSize) {
                obstacleSegments.push([
                        [tileX + Map.tileSize, tileY],
                        [tileX + Map.tileSize, tileY + Map.tileSize]
                ]);
            }
            if(playerY <= tileY) {
                obstacleSegments.push([
                        [tileX, tileY],
                        [tileX + Map.tileSize, tileY]
                ]);
            } else if(playerY >= tileY + Map.tileSize) {
                obstacleSegments.push([
                        [tileX, tileY + Map.tileSize],
                        [tileX + Map.tileSize, tileY + Map.tileSize]
                ]);
            }
        }
        this.addChild(sprite);
      }
    }

    var visibilityPolygonByronFormat = VisibilityPolygon.compute(
            [playerX, playerY], // viewer position
            obstacleSegments,
            [0, 0], // viewport min corner
            [width, height] // viewport max corner
            );
    var visibilityPolygonPIXIFormat = [];
    for(var i = 0; i < visibilityPolygonByronFormat.length; i++) {
        visibilityPolygonPIXIFormat.push(visibilityPolygonByronFormat[i][0]);
        visibilityPolygonPIXIFormat.push(visibilityPolygonByronFormat[i][1]);
    }
    
    var lightPolygon = new PIXI.Graphics();
    lightPolygon.beginFill(0xffffff);
    lightPolygon.drawPolygon(visibilityPolygonPIXIFormat);
    lightPolygon.endFill();
    this.addChild(lightPolygon);
  }
  this.isImpassable = function(x, y) {
    var r = Math.floor(y/Map.tileSize);
    var c = Math.floor(x/Map.tileSize);
    return r < 0 || c < 0 || r >= this.map.length || c >= this.map[0].length ||
           Map.impassable[this.map[r][c]];
  }
  this.getWidth = function() {
      return this.map[0].length;
  }
  this.getHeight = function() {
      return this.map.length;
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
