function Map(map) {
  PIXI.Container.call(this);

  this.map = map;
  this.renderViewport = function(x, y, width, height, playerX, playerY, enemies) {
    this.removeChildren();
    var obstacleSegments = [];
    for (var r = Math.floor(y/Map.tileSize);
        r < Math.min(this.map.length, Math.floor((y + height)/Map.tileSize)+1);
        r++) {
      for (var c = Math.floor(x/Map.tileSize);
          c < Math.min(this.map[0].length, Math.floor((x + width)/Map.tileSize)+1);
          c++) {
        var tileX = c * Map.tileSize - x, tileY = r * Map.tileSize - y;
        var sprite = PIXI.Sprite.fromImage(Map.tiles[this.map[r][c]]);
        sprite.x = tileX;
        sprite.y = tileY;
        sprite.width = Map.tileSize;
        sprite.height = Map.tileSize;
        this.addChild(sprite);
        if(Map.impassable[this.map[r][c]]) {
          if(playerX <= tileX && !Map.impassable[this.map[r][c-1]]) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX, tileY + Map.tileSize]
            ]);
          } else if(playerX >= tileX + Map.tileSize && !Map.impassable[this.map[r][c+1]]) {
            obstacleSegments.push([
                [tileX + Map.tileSize, tileY],
                [tileX + Map.tileSize, tileY + Map.tileSize]
            ]);
          }
          if(playerY <= tileY && !Map.impassable[this.map[r-1][c]]) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX + Map.tileSize, tileY]
            ]);
          } else if(playerY >= tileY + Map.tileSize && !Map.impassable[this.map[r+1][c]]) {
            obstacleSegments.push([
                [tileX, tileY + Map.tileSize],
                [tileX + Map.tileSize, tileY + Map.tileSize]
            ]);
          }
        }
      }
    }

    /*
    for(var i=0; i<obstacleSegments.length; i++) {
      // draw segments used in visibility polygon calculation
      var seg = new PIXI.Graphics();
      seg.beginFill(0xff0000);
      seg.drawRect(obstacleSegments[i][0][0]-2, obstacleSegments[i][0][1]-2,
          obstacleSegments[i][1][0] - obstacleSegments[i][0][0]+4,
          obstacleSegments[i][1][1] - obstacleSegments[i][0][1]+4);
      seg.endFill();
      this.addChild(seg);
    }
    */

    for(var e=0; e<enemies.length; e++) {
      this.drawVisibilityPolygonEnemy(enemies[e], x, y, width, height);
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
    lightPolygon.blendMode = PIXI.BLEND_MODES.ADD;
    lightPolygon.beginFill(0x444444);
    lightPolygon.drawPolygon(visibilityPolygonPIXIFormat);
    lightPolygon.endFill();
    this.addChild(lightPolygon);
  }
  this.drawVisibilityPolygonEnemy = function(enemy, x, y, width, height) {
    var eX = enemy.x * Map.tileSize - x + Map.tileSize/2, eY = enemy.y * Map.tileSize - y + Map.tileSize/2,
      eT = enemy.theta, eR = enemy.radius, eF = enemy.fov;
    var x0 = eX - 1 * Math.cos(eT), y0 = eY - 1 * Math.sin(eT);
    var obstaclePolygon = [[x0, y0]];
    var wedge = [x0, y0];
    // make view range cone have approximately 20 sides per radian
    var dt = ~~(eF * 20);

    for (var t = 0; t <= dt; t++) {
      var a1 = eT - eF/2 + eF * t / dt;
      var x1 = eX + eR * Math.cos(a1),
        y1 = eY + eR * Math.sin(a1);
      obstaclePolygon.push([x1, y1]);
      wedge.push(x1);
      wedge.push(y1);
    }
    var obstacleSegments = VisibilityPolygon.convertToSegments([obstaclePolygon]);
    for (var r = 0;
        r < this.map.length;
        r++) {
      for (var c = 0;
          c < this.map[0].length;
          c++) {
        var tileX = c * Map.tileSize - x, tileY = r * Map.tileSize - y;
        if((tileX - eX) * (tileX - eX) + (tileY - eY) * (tileY - eY) > 
            (eR + 2*Map.tileSize) * (eR + 2*Map.tileSize)) {
          continue;
        }
        if(Map.impassable[this.map[r][c]]) {
          if(eX <= tileX && !Map.impassable[this.map[r][c-1]]) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX, tileY + Map.tileSize]
            ]);
          } else if(eX >= tileX + Map.tileSize && !Map.impassable[this.map[r][c+1]]) {
            obstacleSegments.push([
                [tileX + Map.tileSize, tileY],
                [tileX + Map.tileSize, tileY + Map.tileSize]
            ]);
          }
          if(eY <= tileY && !Map.impassable[this.map[r-1][c]]) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX + Map.tileSize, tileY]
            ]);
          } else if(eY >= tileY + Map.tileSize && !Map.impassable[this.map[r+1][c]]) {
            obstacleSegments.push([
                [tileX, tileY + Map.tileSize],
                [tileX + Map.tileSize, tileY + Map.tileSize]
            ]);
          }
        }
      }
    }
    obstacleSegments = VisibilityPolygon.breakIntersections(obstacleSegments);
    var visibilityPolygonByronFormat = VisibilityPolygon.compute(
        [eX, eY], // viewer position
        obstacleSegments,
        [-1e4, -1e4], // viewport min corner
        [1e4, 1e4] // viewport max corner
        );
    var visibilityPolygonPIXIFormat = [];
    for(var i = 0; i < visibilityPolygonByronFormat.length; i++) {
      visibilityPolygonPIXIFormat.push(visibilityPolygonByronFormat[i][0]);
      visibilityPolygonPIXIFormat.push(visibilityPolygonByronFormat[i][1]);
    }

    var lightPolygon = new PIXI.Graphics();
    lightPolygon.blendMode = PIXI.BLEND_MODES.ADD;
    lightPolygon.beginFill(0x224422);
    lightPolygon.drawPolygon(visibilityPolygonPIXIFormat);
    lightPolygon.endFill();

    lightPolygon.beginFill(0x220000);
    lightPolygon.drawPolygon(wedge);
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
