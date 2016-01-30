var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
function GameManager() {
  PIXI.Container.call(this);

  var instance = this;
  instance.paused = false;
  instance.player = {};
  instance.playerX = 0;
  instance.playerY = 0;
  instance.playerV = 5;
  instance.map = {};
  instance.isDown = [];
  instance.state = {};

  window.addEventListener("keydown", function(evt) {
    if (evt.altKey || evt.metaKey || evt.ctrlKey) return;
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

  var gameLoop = function(dt) {
    if (!instance.paused) {
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
      
      if (dx != 0 || dy != 0) {
        var n = Math.sqrt(Math.abs(dx) + Math.abs(dy));
        var nx = instance.playerX + dx/n*instance.playerV*dt;
        var ny = instance.playerY + dy/n*instance.playerV*dt;
        var alignedx = Math.floor(instance.playerX / Map.tileSize) * Map.tileSize + (instance.playerX / Map.tileSize - Math.floor(instance.playerX / Map.tileSize) < 0.5 ? instance.player.width/2 : Map.tileSize - instance.player.width/2);
        var alignedy = Math.floor(instance.playerY / Map.tileSize) * Map.tileSize + (instance.playerY / Map.tileSize - Math.floor(instance.playerY / Map.tileSize) < 0.5 ? instance.player.height/2 : Map.tileSize - instance.player.height/2);
  
        if (!instance.map.isImpassable(nx + instance.player.width/2, ny + instance.player.height/2) &&
            !instance.map.isImpassable(nx - instance.player.width/2, ny + instance.player.height/2) &&
            !instance.map.isImpassable(nx + instance.player.width/2, ny - instance.player.height/2) &&
            !instance.map.isImpassable(nx - instance.player.width/2, ny - instance.player.height/2)) {
          instance.playerX = nx;
          instance.playerY = ny;
        } else if (dx != 0 &&
            !instance.map.isImpassable(nx + dx*instance.player.width/2, instance.playerY + instance.player.height/2 - 2) &&
            !instance.map.isImpassable(nx + dx*instance.player.width/2, instance.playerY - instance.player.height/2 + 2)) {
          instance.playerX = nx;
          if (dy != 0) instance.playerY = alignedy;
        } else if (dy != 0 &&
            !instance.map.isImpassable(instance.playerX + instance.player.width/2 - 2, ny + dy*instance.player.height/2) &&
            !instance.map.isImpassable(instance.playerX - instance.player.width/2 + 2, ny + dy*instance.player.height/2)) {
          if (dx != 0) instance.playerX = alignedx;
          instance.playerY = ny;
        } else {
          if (dx != 0) instance.playerX = alignedx;
          if (dy != 0) instance.playerY = alignedy;
        }
      }
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

    instance.player.x = (STAGE_WIDTH - instance.player.width)/2 + viewOffsetX;
    instance.player.y = (STAGE_HEIGHT - instance.player.height)/2 + viewOffsetY;
    instance.map.renderViewport(mapX, mapY, 
            STAGE_WIDTH, STAGE_HEIGHT, 
            instance.player.x + instance.player.width/2, instance.player.y + instance.player.height/2);
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

    instance.player = PIXI.Sprite.fromImage("../assets/img/player.png");
    instance.player.x = (STAGE_WIDTH - instance.player.width)/2;
    instance.player.y = (STAGE_HEIGHT - instance.player.height)/2;

    var mapLoaded = function(loader) {
      var data = loader.resources["map"].data;
      instance.playerX = data.playerX * Map.tileSize + Map.tileSize / 2;
      instance.playerY = data.playerY * Map.tileSize + Map.tileSize / 2;
      instance.map = new Map(data.map);

      instance.addChild(instance.map);
      instance.addChild(instance.player);
      
      var ui = new UI();
      ui.y = STAGE_HEIGHT;
      instance.addChild(ui);
     
      PIXI.ticker.shared.add(gameLoop, instance);
      instance.showDialogue("../assets/dialogues/tutorial.json");
    }
    PIXI.loader.add("map", GameManager.maps[map]).load(mapLoaded);
  }

  this.loadMap(0);
}
GameManager.prototype = Object.create(PIXI.Container.prototype);
GameManager.prototype.constructor = GameManager;
GameManager.maps = [
  "../assets/maps/tutorial.json"
];
