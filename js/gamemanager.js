var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var ENEMY_OMEGA = 3, ENEMY_V = 0.1;
function GameManager() {
  PIXI.Container.call(this);

  var instance = this;
  instance.paused = false;
  instance.player = {};
  instance.playerX = 0;
  instance.playerY = 0;
  instance.playerV = 7;
  instance.map = {};
  instance.spritesLayer = {};
  instance.isDown = [];
  instance.state = {};

  window.addEventListener("keydown", function(evt) {
    if (evt.altKey || evt.metaKey || evt.ctrlKey) return
    instance.isDown[evt.keyCode] = true;
    evt.preventDefault();
  });
  window.addEventListener("keyup", function(evt) {
    instance.isDown[evt.keyCode] = false;
    evt.preventDefault();
  });
  var isDown = function(keyCode) {
    return keyCode in instance.isDown && instance.isDown[keyCode];
  }

  var addItem = function(item) {
    instance.state[item] = true;
  }
  var removeItem = function(item) {
    instance.state[item] = false;
  }
  var checkItem = function(item) {
    return item in instance.state && instance.state[item];
  }

  this.loadMap = function(map) {
    PIXI.ticker.shared.remove(gameLoop, instance);
    instance.removeChildren();
    SpritePool.resetSprites();

    instance.state["level"] = map;

    var data = PIXI.loader.resources[GameManager.maps[map]].data;
    instance.map = new Map(data.map);
    instance.addChild(instance.map);

    instance.spritesLayer = new PIXI.Container();
    instance.addChild(instance.spritesLayer);
    
    var ui = new UI();
    ui.y = STAGE_HEIGHT;
    instance.addChild(ui);

    instance.playerX = data.playerX * TILE_SIZE + TILE_SIZE / 2;
    instance.playerY = data.playerY * TILE_SIZE + TILE_SIZE / 2;
    instance.player = new PIXI.Sprite(SpritePool.getTexture(SpritePool.PLAYER_DOWN));
    instance.player.scale = new PIXI.Point(0.5, 0.5);
    instance.spritesLayer.addChild(instance.player);
    
    instance.enemies = data.enemies;
    for(var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
      ee.sprite = new PIXI.extras.MovieClip(SpritePool.getTextures(SpritePool.ENEMY1_DOWN_STAND));
      ee.sprite.play();
      instance.spritesLayer.addChild(ee.sprite);
      ee.x = ee.keypoints[0][0];
      ee.y = ee.keypoints[0][1];
      ee.k = 0; // which keypoint the ee is at
      for(var i=0; i<ee.keypoints.length; i++) {
        if (ee.keypoints[i].length < 3) {
          var i2 = (i+1) % ee.keypoints.length;
          ee.keypoints[i].push(
            Math.atan2(
              ee.keypoints[i2][1] - ee.keypoints[i][1],
              ee.keypoints[i2][0] - ee.keypoints[i][0]) / Math.PI * 180
            );
        }
      }
      ee.theta = ee.keypoints[0][2] * Math.PI / 180;
      if (!("omega" in ee)) ee.omega = ENEMY_OMEGA;
      ee.fov_r = ee.fov * Math.PI / 180;
      ee.omega_r = ee.omega * Math.PI / 180;
      if (!("speed" in ee)) ee.speed = ENEMY_V;
      ee.rotating = 0;
    }

    instance.resume();
    PIXI.ticker.shared.add(gameLoop, instance);
  }

  var gameLoop = function() {
    if (instance.paused) return;

    var ox = 0;
    var oy = 0;
    var CONVEYOR_SPEED = 2;
    switch(instance.map.getTile(instance.playerX, instance.playerY)) {
      case Map.CONVEYOR_L:
        ox -= CONVEYOR_SPEED; 
        break;
      case Map.CONVEYOR_R:
        ox += CONVEYOR_SPEED; 
        break;
      case Map.CONVEYOR_U:
        oy -= CONVEYOR_SPEED; 
        break;
      case Map.CONVEYOR_D:
        oy += CONVEYOR_SPEED; 
        break;
    }

    var dx = 0;
    var dy = 0;
    if (isDown(LEFT)) {
      dx--;
    }
    if (isDown(UP)) {
      dy--;
    }
    if (isDown(RIGHT)) {
      dx++;
    }
    if (isDown(DOWN)) {
      dy++;
    }
    
    var n = Math.max(1, Math.sqrt(Math.abs(dx) + Math.abs(dy)));
    var nx = instance.playerX + dx/n*instance.playerV + ox;
    var ny = instance.playerY + dy/n*instance.playerV + oy;
    var alignedx = Math.floor(instance.playerX / TILE_SIZE) * TILE_SIZE + (instance.playerX / TILE_SIZE - Math.floor(instance.playerX / TILE_SIZE) < 0.5 ? instance.player.width/2 : TILE_SIZE - instance.player.width/2);
    var alignedy = Math.floor(instance.playerY / TILE_SIZE) * TILE_SIZE + (instance.playerY / TILE_SIZE - Math.floor(instance.playerY / TILE_SIZE) < 0.5 ? instance.player.height/2 : TILE_SIZE - instance.player.height/2);
  
    if (!instance.map.isImpassableAt(nx + instance.player.width/2, ny + instance.player.height/2) &&
        !instance.map.isImpassableAt(nx - instance.player.width/2, ny + instance.player.height/2) &&
        !instance.map.isImpassableAt(nx + instance.player.width/2, ny - instance.player.height/2) &&
        !instance.map.isImpassableAt(nx - instance.player.width/2, ny - instance.player.height/2)) {
      instance.playerX = nx;
      instance.playerY = ny;
    } else if (nx != instance.playerX &&
        !instance.map.isImpassableAt(nx + sign(nx - instance.playerX)*instance.player.width/2, instance.playerY + instance.player.height/2 - 2) &&
        !instance.map.isImpassableAt(nx + sign(nx - instance.playerX)*instance.player.width/2, instance.playerY - instance.player.height/2 + 2)) {
      instance.playerX = nx;
      if (ny != instance.playerY) instance.playerY = alignedy;
    } else if (ny != instance.playerY &&
        !instance.map.isImpassableAt(instance.playerX + instance.player.width/2 - 2, ny + sign(ny - instance.playerY)*instance.player.height/2) &&
        !instance.map.isImpassableAt(instance.playerX - instance.player.width/2 + 2, ny + sign(ny - instance.playerY)*instance.player.height/2)) {
      if (nx != instance.playerX) instance.playerX = alignedx;
      instance.playerY = ny;
    } else {
      if (nx != instance.playerX) instance.playerX = alignedx;
      if (ny != instance.playerY) instance.playerY = alignedy;
    }

    this.updateEnemies();
    for (var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
      ee.detected = false;
      if (dx == 0 && dy == 0) continue;
      
      var eX = ee.x * TILE_SIZE + TILE_SIZE/2, eY = ee.y * TILE_SIZE + TILE_SIZE/2;
      var pX = [instance.playerX + instance.player.width/2 - 2, instance.playerX - instance.player.width/2 + 2];
      var pY = [instance.playerY + instance.player.height/2 - 2, instance.playerY - instance.player.height/2 + 2];
      for (var i=0; i < pX.length; i++) for (var j=0; j < pY.length; j++) {
        if (dist2(eX, eY, pX[i], pY[j]) > ee.radius*ee.radius) continue;
        var t = Math.atan2(pY[j]-eY, pX[i]-eX) - ee.theta;
        while(t <= -Math.PI) t += 2*Math.PI;
        while(t > Math.PI) t -= 2*Math.PI;
        if (Math.abs(t)*2 > ee.fov_r) continue;
        var blocked = false;
        for (var x = eX; x <= pX[i]; x += TILE_SIZE) {
          for (var y = eY; y <= pY[j]; y += TILE_SIZE) {
            var tx = Math.floor(x / TILE_SIZE) * TILE_SIZE, ty = Math.floor(y / TILE_SIZE) * TILE_SIZE;
            if (instance.map.isImpassableAt(x, y) &&
                (VisibilityPolygon.intersectLines([eX, eY], [pX[i], pY[j]], [tx, ty], [tx, ty+TILE_SIZE]).length != 0 ||
                 VisibilityPolygon.intersectLines([eX, eY], [pX[i], pY[j]], [tx, ty], [tx+TILE_SIZE, ty]).length != 0 ||
                 VisibilityPolygon.intersectLines([eX, eY], [pX[i], pY[j]], [tx, ty+TILE_SIZE], [tx+TILE_SIZE, ty+TILE_SIZE]).length != 0 ||
                 VisibilityPolygon.intersectLines([eX, eY], [pX[i], pY[j]], [tx+TILE_SIZE, ty], [tx+TILE_SIZE, ty+TILE_SIZE]).length != 0)) {
              blocked = true;
            }
          } 
        }
        if (!blocked) ee.detected = true;
      }
      if (ee.detected) {
        instance.paused = true;
        if (instance.state["level"] == 1 && !("hasBeenCaught" in instance.state)) {
          instance.state["hasBeenCaught"] = true;
          instance.showDialogue(GameManager.dialogues[1], instance.loadMap.bind(instance, instance.state["level"]));
        } else {
          instance.showDialogue(GameManager.dialogues[1], instance.loadMap.bind(instance, instance.state["level"]), 1000);
        }
      }
    } 
      
    // offset the view if the player is scrolling to the edge of the map
    var viewOffsetX = 0, viewOffsetY = 0, mapX, mapY;
    mapX = instance.playerX - STAGE_WIDTH/2;
    mapY = instance.playerY - STAGE_HEIGHT/2;

    if (mapX < 0) {
      viewOffsetX = mapX;
    } else if (mapX + STAGE_WIDTH >= instance.map.getWidth()) {
      viewOffsetX = mapX + STAGE_WIDTH - instance.map.getWidth();
    }
    mapX -= viewOffsetX;

    if (mapY < 0) {
      viewOffsetY = mapY;
    } else if (mapY + STAGE_HEIGHT >= instance.map.getHeight()) {
      viewOffsetY = mapY + STAGE_HEIGHT - instance.map.getHeight();
    }
    mapY -= viewOffsetY;

    if (dy > 0) {
      instance.player.texture = SpritePool.getTexture(SpritePool.PLAYER_DOWN);
    } else if (dy < 0) {
      instance.player.texture = SpritePool.getTexture(SpritePool.PLAYER_UP);
    } else if (dx != 0) {
      instance.player.texture = SpritePool.getTexture(SpritePool.PLAYER_SIDE);
    } 
    instance.player.x = (STAGE_WIDTH - instance.player.width)/2 + viewOffsetX;
    instance.player.y = (STAGE_HEIGHT - instance.player.height)/2 + viewOffsetY;

    for(var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
      ee.sprite.x = ee.x * TILE_SIZE - instance.playerX + instance.player.x;
      ee.sprite.y = ee.y * TILE_SIZE - instance.playerY + instance.player.y; 
    }
    instance.map.renderViewport(mapX, mapY, 
            STAGE_WIDTH, STAGE_HEIGHT, 
            instance.player.x + instance.player.width/2, instance.player.y + instance.player.height/2,
            instance.enemies);

    instance.spritesLayer.children.sort(function(a, b) {
      return a.y - b.y;
    });

    if (instance.state["level"] == 1 && instance.map.getTile(instance.playerX, instance.playerY) == Map.WALK_LICENSE) {
      instance.showDialogue(GameManager.dialogues[2], instance.loadMap.bind(instance, 2));
    }
  }

  this.resume = function() {
    instance.paused = false;
  }

  this.showDialogue = function(dialogue, cb, timeout) {
    instance.paused = true;
    instance.addChild(Dialogue.showDialogue(dialogue, cb || instance.resume, timeout));
  }

  this.updateEnemies = function() {
    for (var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
      if (ee.rotating === 0) {
        // move towards target
        var goal = ee.keypoints[(ee.k+1) % ee.keypoints.length];
        var d = Math.sqrt(dist2(ee.x, ee.y, goal[0], goal[1]));
        if(d < ee.speed) {
          ee.rotating = 1;
          ee.k = (ee.k+1) % ee.keypoints.length;
        } else {
          var dx = (goal[0] - ee.x)/d,
              dy = (goal[1] - ee.y)/d;
          ee.x += dx * ee.speed;
          ee.y += dy * ee.speed;
  
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_RIGHT_WALK);
            } else { 
              ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_LEFT_WALK);
            }
          } else {
            if (dy > 0) {
              ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_DOWN_WALK);
            } else {
              ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_UP_WALK);
            }
          }
        }
      } 
      if (ee.rotating) {
        // rotate towards target
        var goal = ee.keypoints[ee.k][2] * Math.PI / 180;
        var dtheta = goal - ee.theta;
        while(dtheta <= -Math.PI) dtheta += 2*Math.PI;
        while(dtheta > Math.PI) dtheta -= 2*Math.PI;
        if(Math.abs(dtheta) <= ee.omega_r) {
          ee.theta = goal;
          ee.rotating = 0;
        } else if(dtheta < 0) {
          ee.theta -= ee.omega_r;
        } else {
          ee.theta += ee.omega_r;
        }

        var dx = Math.cos(ee.theta), dy = Math.sin(ee.theta);
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_RIGHT_STAND);
          } else { 
            ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_LEFT_STAND);
          }
        } else {
          if (dy > 0) {
            ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_DOWN_STAND);
          } else {
            ee.sprite.textures = SpritePool.getTextures(SpritePool.ENEMY1_UP_STAND);
          } 
        }
      } 
    }
  }

  this.play = function() {
    instance.loadMap(1);
  }
}
GameManager.prototype = Object.create(PIXI.Container.prototype);
GameManager.prototype.constructor = GameManager;
GameManager.maps = [
  "../assets/maps/tutorial.json",
  "../assets/maps/level1.json",
  "../assets/maps/levelcarolyn.json"
];
GameManager.dialogues = [
  "../assets/dialogues/tutorial.json",
  "../assets/dialogues/nolicensetowalk.json",
  "../assets/dialogues/walklicenseobtained.json"
];
