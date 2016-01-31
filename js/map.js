function Map(map) {
  PIXI.Container.call(this);

  this.map = map;
  this.getWidth = function() {
    return this.map[0].length * TILE_SIZE;
  }
  this.getHeight = function() {
    return this.map.length * TILE_SIZE;
  }
  this.getTile = function(x, y) {
    // Assumes x, y in range
    return this.map[Math.floor(y/TILE_SIZE)][Math.floor(x/TILE_SIZE)];
  }
  this.isImpassable = function(tile) {
    return Map.tiles[tile][2];
  }
  this.isImpassableAt = function(x, y) {
    if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) return true; 
    return this.isImpassable(this.getTile(x, y));
  }
  this.renderViewport = function(x, y, width, height, playerX, playerY, enemies) {
    this.removeChildren();
    Map.spritePoolIdx = {};
    var obstacleSegments = [];
    for (var r = Math.floor(y/TILE_SIZE);
        r < Math.min(this.map.length, Math.floor((y + height)/TILE_SIZE)+1);
        r++) {
      for (var c = Math.floor(x/TILE_SIZE);
          c < Math.min(this.map[0].length, Math.floor((x + width)/TILE_SIZE)+1);
          c++) {
        var tileX = c * TILE_SIZE - x, tileY = r * TILE_SIZE - y;
        
        var sprite = SpritePool.getSprite(Map.tiles[this.map[r][c]][0]);
	sprite.x = tileX + TILE_SIZE/2;
        sprite.y = tileY + TILE_SIZE/2;
        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.rotation = Map.tiles[this.map[r][c]][1] * Math.PI / 180;
        this.addChild(sprite);

        if(this.isImpassable(this.map[r][c])) {
          if(playerX <= tileX && !this.isImpassable(this.map[r][c-1])) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX, tileY + TILE_SIZE]
            ]);
          } else if(playerX >= tileX + TILE_SIZE && !this.isImpassable(this.map[r][c+1])) {
            obstacleSegments.push([
                [tileX + TILE_SIZE, tileY],
                [tileX + TILE_SIZE, tileY + TILE_SIZE]
            ]);
          }
          if(playerY <= tileY && !this.isImpassable(this.map[r-1][c])) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX + TILE_SIZE, tileY]
            ]);
          } else if(playerY >= tileY + TILE_SIZE && !this.isImpassable(this.map[r+1][c])) {
            obstacleSegments.push([
                [tileX, tileY + TILE_SIZE],
                [tileX + TILE_SIZE, tileY + TILE_SIZE]
            ]);
          }
        }
      }
    }
    obstacleSegments.push([[0, 0], [width, 0]]);
    obstacleSegments.push([[0, height], [width, height]]);
    obstacleSegments.push([[0, 0], [0, height]]);
    obstacleSegments.push([[width, 0], [width, height]]);
    obstacleSegments = VisibilityPolygon.breakIntersections(obstacleSegments);


    for(var e=0; e<enemies.length; e++) {
      this.drawVisibilityPolygonEnemy(enemies[e], x, y, width, height);
    }

    /*/
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
    //*/

    var visibilityPolygonByronFormat = VisibilityPolygon.compute(
        [playerX, playerY], // viewer position
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
    //lightPolygon.lineStyle(3, 0xff00ff, 1);
    lightPolygon.beginFill(0x444444);
    lightPolygon.drawPolygon(visibilityPolygonPIXIFormat);
    lightPolygon.endFill();
    this.addChild(lightPolygon);
  }
  this.drawVisibilityPolygonEnemy = function(enemy, x, y, width, height) {
    var eX = enemy.x * TILE_SIZE + TILE_SIZE/2 - x, eY = enemy.y * TILE_SIZE + TILE_SIZE/2 - y,
      eT = enemy.theta, eR = enemy.radius, eF = enemy.fov_r;
    if(eX < -eR || eY < -eR || eX > width + eR || eY > height + eR) {
      return;
    }
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
        var tileX = c * TILE_SIZE - x, tileY = r * TILE_SIZE - y;
        if((tileX - eX) * (tileX - eX) + (tileY - eY) * (tileY - eY) > 
            (eR + 2*TILE_SIZE) * (eR + 2*TILE_SIZE)) {
          continue;
        }
        if(this.isImpassable(this.map[r][c])) {
          if(eX <= tileX && !this.isImpassable(this.map[r][c-1])) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX, tileY + TILE_SIZE]
            ]);
          } else if(eX >= tileX + TILE_SIZE && !this.isImpassable(this.map[r][c+1])) {
            obstacleSegments.push([
                [tileX + TILE_SIZE, tileY],
                [tileX + TILE_SIZE, tileY + TILE_SIZE]
            ]);
          }
          if(eY <= tileY && !this.isImpassable(this.map[r-1][c])) {
            obstacleSegments.push([
                [tileX, tileY],
                [tileX + TILE_SIZE, tileY]
            ]);
          } else if(eY >= tileY + TILE_SIZE && !this.isImpassable(this.map[r+1][c])) {
            obstacleSegments.push([
                [tileX, tileY + TILE_SIZE],
                [tileX + TILE_SIZE, tileY + TILE_SIZE]
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
    if (enemy.detected) {
      lightPolygon.beginFill(0xFF0000);
    }    
    lightPolygon.drawPolygon(wedge);
    lightPolygon.endFill();
    this.addChild(lightPolygon);

  }
}
Map.prototype = Object.create(PIXI.Container.prototype);
Map.prototype.constructor = Map;

Map.GROUND = 0;
Map.WALL = 1;
Map.CONVEYOR_L = 2;
Map.CONVEYOR_U = 3;
Map.CONVEYOR_R = 4;
Map.CONVEYOR_D = 5;

// Format: [spritepool_id, rotation (degrees clockwise), impassable]
Map.tiles = [];
Map.tiles[Map.GROUND] = [SpritePool.GROUND, 0, false];
Map.tiles[Map.WALL] = [SpritePool.WALL, 0, true];
Map.tiles[Map.CONVEYOR_L] = [SpritePool.CONVEYOR, 0, false];
Map.tiles[Map.CONVEYOR_U] = [SpritePool.CONVEYOR, 90, false];
Map.tiles[Map.CONVEYOR_R] = [SpritePool.CONVEYOR, 180, false];
Map.tiles[Map.CONVEYOR_D] = [SpritePool.CONVEYOR, 270, false];
