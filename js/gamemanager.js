function GameManager() {
  PIXI.Container.call(this);

  var instance = this;
  instance.player = {};
  instance.playerX = 0;
  instance.playerY = 0;
  instance.playerV = 5;
  instance.dx = 0;
  instance.dy = 0;
  instance.map = {};

  window.addEventListener("keydown", function(evt) {
    switch(evt.keyCode) {
      case 37: // left
        instance.dx--;
        break;
      case 38: // up
        instance.dy--;
        break;
      case 39: // right
        instance.dx++;
        break;
      case 40: // down
        instance.dy++;
        break;
    }
    instance.dx = Math.min(1, Math.max(-1, instance.dx));
    instance.dy = Math.min(1, Math.max(-1, instance.dy));
    event.preventDefault();
  });
  window.addEventListener("keyup", function(evt) {
    switch(evt.keyCode) {
      case 37: // left
        instance.dx++;
        break;
      case 38: // up
        instance.dy++;
        break;
      case 39: // right
        instance.dx--;
        break;
      case 40: // down
        instance.dy--;
        break;
    }
    instance.dx = Math.min(1, Math.max(-1, instance.dx));
    instance.dy = Math.min(1, Math.max(-1, instance.dy));
    event.preventDefault();
  });

  var gameLoop = function(dt) {
    var dx = instance.dx;
    var dy = instance.dy;
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
      } else if (!instance.map.isImpassable(nx + dx*instance.player.width/2, instance.playerY + instance.player.height/2 - 2) &&
                 !instance.map.isImpassable(nx + dx*instance.player.width/2, instance.playerY - instance.player.height/2 + 2)) {
        instance.playerX = nx;
        instance.playerY = alignedy;
      } else if (!instance.map.isImpassable(instance.playerX + instance.player.width/2 - 2, ny + dy*instance.player.height/2) &&
                 !instance.map.isImpassable(instance.playerX - instance.player.width/2 + 2, ny + dy*instance.player.height/2)) {
        instance.playerX = alignedx;
        instance.playerY = ny;
      } else {
        instance.playerX = alignedx;
        instance.playerY = alignedy;
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

    instance.player.x = (STAGE_WIDTH - instance.player.width)/2 + viewOffsetX;
    instance.player.y = (STAGE_HEIGHT - instance.player.height)/2 + viewOffsetY;
    instance.map.renderViewport(mapX, mapY, 
            STAGE_WIDTH, STAGE_HEIGHT, 
            instance.player.x + instance.player.width/2, instance.player.y + instance.player.height/2);
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
      PIXI.ticker.shared.add(gameLoop, instance);
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
