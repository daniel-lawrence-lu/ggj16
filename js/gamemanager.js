var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var ENEMY_OMEGA = 5, ENEMY_V = 0.5;
function GameManager() {
  PIXI.Container.call(this);

  var instance = this;
  instance.paused = false;
  instance.player = {};
  instance.playerX = 0;
  instance.playerY = 0;
  instance.playerV = 15;
  instance.map = {};
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

  var gameLoop = function() {
    if (!instance.paused) {
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
    } // if (instance.paused)
      
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
      instance.player.texture = SpritePool.getTextures(SpritePool.PLAYER_DOWN);
    } else if (dy < 0) {
      instance.player.texture = SpritePool.getTextures(SpritePool.PLAYER_UP);
    } else if (dx != 0) {
      instance.player.texture = SpritePool.getTextures(SpritePool.PLAYER_SIDE);
    } 
    instance.player.x = (STAGE_WIDTH - instance.player.width)/2 + viewOffsetX;
    instance.player.y = (STAGE_HEIGHT - instance.player.height)/2 + viewOffsetY;
    instance.map.renderViewport(mapX, mapY, 
            STAGE_WIDTH, STAGE_HEIGHT, 
            instance.player.x + instance.player.width/2, instance.player.y + instance.player.height/2,
            instance.enemies);
  }

  this.resume = function() {
    instance.paused = false;
  }

  this.showDialogue = function(dialogue) {
    instance.paused = true;
    instance.addChild(Dialogue.showDialogue(dialogue, instance.resume));
  }

  this.loadMap = function(map) {
    PIXI.ticker.shared.remove(gameLoop, instance);
    instance.removeChildren();

    var data = PIXI.loader.resources[map].data;
    instance.map = new Map(data.map);
    instance.addChild(instance.map);

    instance.playerX = data.playerX * TILE_SIZE + TILE_SIZE / 2;
    instance.playerY = data.playerY * TILE_SIZE + TILE_SIZE / 2;
    instance.player = new PIXI.Sprite(SpritePool.getTextures(SpritePool.PLAYER_DOWN));
    instance.player.scale = new PIXI.Point(0.5, 0.5);
    instance.addChild(instance.player);
    
    var ui = new UI();
    ui.y = STAGE_HEIGHT;
    instance.addChild(ui);
    
    instance.enemies = data.enemies;
    for(var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
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
      ee.omega *= Math.PI / 180;
      if (!("speed" in ee)) ee.speed = ENEMY_V;
      ee.rotating = 0;
    }

    PIXI.ticker.shared.add(gameLoop, instance);
  }

  this.updateEnemies = function() {
    for(var e=0; e<instance.enemies.length; e++) {
      var ee = instance.enemies[e];
      if(ee.rotating === 0) {
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
        }
      } else {
        // rotate towards target
        var goal = ee.keypoints[ee.k][2] * Math.PI / 180;
        var dtheta = goal - ee.theta;
        while(dtheta <= -Math.PI) dtheta += 2*Math.PI;
        while(dtheta > Math.PI) dtheta -= 2*Math.PI;
        if(Math.abs(dtheta) <= ee.omega) {
          ee.theta = goal;
          ee.rotating = 0;
        } else if(dtheta < 0) {
          ee.theta -= ee.omega;
        } else {
          ee.theta += ee.omega;
        }
      }
    }
  }

  this.play = function() {
    this.loadMap(GameManager.maps[1]);
  }
}
GameManager.prototype = Object.create(PIXI.Container.prototype);
GameManager.prototype.constructor = GameManager;
GameManager.maps = [
  "../assets/maps/tutorial.json",
  "../assets/maps/level1.json"
];
GameManager.dialogues = [
  "../assets/dialogues/tutorial.json"
];
