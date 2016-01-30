function Map(map) {
  PIXI.Container.call(this);

  this.map = map;
  this.getTile = function(x, y) {
    // Assumes x, y in range
    return this.map[Math.floor(y/Map.tileSize)][Math.floor(x/Map.tileSize)];
  }
  this.renderViewport = function(x, y, width, height, playerX, playerY, enemies) {
    this.removeChildren();
    Map.spritePoolIdx = {};
    var obstacleSegments = [];
    for (var r = Math.floor(y/Map.tileSize);
        r < Math.min(this.map.length, Math.floor((y + height)/Map.tileSize)+1);
        r++) {
      for (var c = Math.floor(x/Map.tileSize);
          c < Math.min(this.map[0].length, Math.floor((x + width)/Map.tileSize)+1);
          c++) {
        var tileX = c * Map.tileSize - x, tileY = r * Map.tileSize - y;
        
        var sprite = Map.getSprite(Map.tiles[this.map[r][c]][0]);
	sprite.x = tileX + Map.tileSize/2;
        sprite.y = tileY + Map.tileSize/2;
        sprite.width = Map.tileSize;
        sprite.height = Map.tileSize;
        sprite.rotation = Map.tiles[this.map[r][c]][1] * Math.PI / 180;
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
    var x0 = eX - 1 * Math.sin(eT), y0 = eY - 1 * Math.cos(eT);
    var obstaclePolygon = [[x0, y0]];
    var wedge = [x0, y0];
    // make view range cone have approximately 20 sides per radian
    var dt = ~~(eF * 20);

    for (var t = 0; t <= dt; t++) {
      var a1 = eT - eF/2 + eF * t / dt;
      var x1 = eX + eR * Math.sin(a1),
        y1 = eY + eR * Math.cos(a1);
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

Map.assetTileSize = 64;
Map.tileSize = 64;

Map.GROUND = 0;
Map.WALL = 1;
Map.CONVEYOR_L = 2;
Map.CONVEYOR_D = 3;
Map.CONVEYOR_R = 4;
Map.CONVEYOR_U = 5;

// Rotations: degrees clockwise
Map.tiles = [
  ["../assets/img/ground.png", 0],
  ["../assets/img/wall.png", 0],
  ["../assets/img/conveyor.png", 0],
  ["../assets/img/conveyor.png", 90],
  ["../assets/img/conveyor.png", 180],
  ["../assets/img/conveyor.png", 270],
];
Map.impassable = [
  false,
  true,
  false,
  false,
  false,
  false,
];

Map.spritePool = {};
Map.spritePoolIdx = {};

Map.getSprite = function(sprite) {
  if (!(sprite in Map.spritePoolIdx)) {
    Map.spritePoolIdx[sprite] = 0;
  }
  return Map.spritePool[sprite][Map.spritePoolIdx[sprite]++];
}

Map.preload = function(progressCb, doneCb) {
  var added = {};
  // Misc assets:
  PIXI.loader.add([
    "../assets/img/player.png",
  ]);
  for (var i in Map.tiles) {
    if (!(Map.tiles[i][0] in added)) {
      PIXI.loader.add(Map.tiles[i][0]);
      added[Map.tiles[i][0]] = true;
    }
  }
  PIXI.loader.on('progress', progressCb).load(function(loader) {
    for (var i in loader.resources) {
      if (i in Map.spritePool) continue;
      Map.spritePool[i] = [];

      // Assumes texture is 1 row of assetTileSize x assetTileSize tiles.
      var frames = [];
      var texture = loader.resources[i].texture;
      for (var l = 0; l < texture.width; l += Map.assetTileSize) {
        frames.push(new PIXI.Texture(texture, new PIXI.Rectangle(l, 0, Math.min(texture.width, Map.assetTileSize), Math.min(texture.height, Map.assetTileSize))));
      }

      var MAX_SPRITES = (Math.ceil(STAGE_WIDTH / Map.tileSize) + 1) * (Math.ceil(STAGE_HEIGHT / Map.tileSize) + 1);
      for (var j=0; j < MAX_SPRITES; j++) {
        var sprite;
        if (frames.length == 1) {
          sprite = new PIXI.Sprite(frames[0]);
        } else {
          sprite = new PIXI.extras.MovieClip(frames);
          sprite.animationSpeed = 0.2;
          sprite.play();
        }
        sprite.anchor = new PIXI.Point(0.5, 0.5);
        Map.spritePool[i].push(sprite);
      }
    }
    doneCb();
  });
}

