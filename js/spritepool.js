function SpritePool() {}

SpritePool.GROUND = 0;
SpritePool.WALL = 1;
SpritePool.CONVEYOR = 2;
SpritePool.PLAYER_UP = 3;
SpritePool.PLAYER_DOWN = 4;
SpritePool.PLAYER_SIDE = 5;
SpritePool.ENEMY1_UP_WALK = 6;
SpritePool.ENEMY1_UP_STAND = 7;
SpritePool.ENEMY1_DOWN_WALK = 8;
SpritePool.ENEMY1_DOWN_STAND = 9;
SpritePool.ENEMY1_LEFT_WALK = 10;
SpritePool.ENEMY1_LEFT_STAND = 11;
SpritePool.ENEMY1_RIGHT_WALK = 12;
SpritePool.ENEMY1_RIGHT_STAND = 13;
SpritePool.WALK_LICENSE = 14;
SpritePool.WALK_LICENSE_SIGN_LEFT = 15;
SpritePool.WALK_LICENSE_SIGN_RIGHT = 16;
SpritePool.GUN = 17;
SpritePool.BULLET = 18;
SpritePool.GUN_LICENSE = 51;
SpritePool.GUN_TRAINING_SIGN_LEFT = 52;
SpritePool.GUN_TRAINING_SIGN_RIGHT = 53;


// FORMAT: [path, frames, max_instances (0 to cache texture only)]
SpritePool.METADATA = [];
var MAX_TILES = Math.max(1000, (Math.ceil(STAGE_WIDTH / TILE_SIZE) + 1) * (Math.ceil(STAGE_HEIGHT / TILE_SIZE) + 1));
SpritePool.METADATA[SpritePool.GROUND] = ["../assets/img/ground.png", [0], MAX_TILES]; 
SpritePool.METADATA[SpritePool.WALL] = ["../assets/img/wall.png", [0], MAX_TILES]; 
SpritePool.METADATA[SpritePool.CONVEYOR] = ["../assets/img/conveyor.png", range(0, 32), MAX_TILES]; 
SpritePool.METADATA[SpritePool.PLAYER_UP] = ["../assets/img/robot.png", [0], 0]; 
SpritePool.METADATA[SpritePool.PLAYER_DOWN] = ["../assets/img/robot.png", [1], 0]; 
SpritePool.METADATA[SpritePool.PLAYER_SIDE] = ["../assets/img/robot.png", [2], 0]; 
SpritePool.METADATA[SpritePool.ENEMY1_UP_WALK] = ["../assets/img/human.png", repeatEach([0, 1, 0, 2], 8)]; 
SpritePool.METADATA[SpritePool.ENEMY1_UP_STAND] = ["../assets/img/human.png", [0], 0]; 
SpritePool.METADATA[SpritePool.ENEMY1_DOWN_WALK] = ["../assets/img/human.png", repeatEach([3, 4, 3, 5], 8), 0]; 
SpritePool.METADATA[SpritePool.ENEMY1_DOWN_STAND] = ["../assets/img/human.png", [3], 0];
SpritePool.METADATA[SpritePool.ENEMY1_LEFT_WALK] = ["../assets/img/human.png", repeatEach([6, 7, 8, 9, 8, 7], 8), 0]; 
SpritePool.METADATA[SpritePool.ENEMY1_LEFT_STAND] = ["../assets/img/human.png", [7], 0];
SpritePool.METADATA[SpritePool.ENEMY1_RIGHT_WALK] = ["../assets/img/human.png", repeatEach([10, 11, 12, 13, 12, 11], 8), 0]; 
SpritePool.METADATA[SpritePool.ENEMY1_RIGHT_STAND] = ["../assets/img/human.png", [11], 0];
SpritePool.METADATA[SpritePool.WALK_LICENSE] = ["../assets/img/walk_license.png", [0], 1]; 
SpritePool.METADATA[SpritePool.WALK_LICENSE_SIGN_LEFT] = ["../assets/img/walk_license_sign.png", [0], 1]; 
SpritePool.METADATA[SpritePool.WALK_LICENSE_SIGN_RIGHT] = ["../assets/img/walk_license_sign.png", [1], 1]; 
SpritePool.METADATA[SpritePool.GUN] = ["../assets/img/gun.png", [0], 1]; 
SpritePool.METADATA[SpritePool.BULLET] = ["../assets/img/bullet.png", [0], 500]; 
SpritePool.METADATA[SpritePool.GUN_LICENSE] = ["../assets/img/gun_license.png", [0], 1]; 
SpritePool.METADATA[SpritePool.GUN_TRAINING_SIGN_LEFT] = ["../assets/img/gun_training_sign.png", [0], 1]; 
SpritePool.METADATA[SpritePool.GUN_TRAINING_SIGN_RIGHT] = ["../assets/img/gun_training_sign.png", [1], 1]; 

SpritePool.WALLS = [];
SpritePool.WALL2S = [];
for(var w=0; w<16; w++) {
    SpritePool.WALLS[w] = 19 + w;
    SpritePool.METADATA[SpritePool.WALLS[w]] = ["../assets/img/wall.png", [w], MAX_TILES];
    SpritePool.WALL2S[w] = 35 + w;
    SpritePool.METADATA[SpritePool.WALL2S[w]] = ["../assets/img/wall2.png", [w], MAX_TILES];
}

SpritePool.texturePool = {};
SpritePool.pool = {};
SpritePool.idx = {};
SpritePool.getTexture = function(sprite) {
  return SpritePool.texturePool[sprite][0];
}
SpritePool.getTextures = function(sprite) {
  return SpritePool.texturePool[sprite];
}
SpritePool.getSprite = function(sprite) {
  if (!(sprite in SpritePool.idx)) {
    SpritePool.idx[sprite] = -1;
  }
  var pool = SpritePool.pool[sprite];
  var out = pool[(++SpritePool.idx[sprite]) % pool.length];
  out.visible = true;
  return out;
}
SpritePool.resetSprites = function() {
  for (var sprite in SpritePool.pool) {
    for (var i=0; i < SpritePool.pool[sprite].length; i++) {
      SpritePool.pool[sprite][i].visible = false;
    }
  }
}

SpritePool.preload = function(progressCb, doneCb) {
  var added = {};
  for (var i in GameManager.maps) {
    var path = GameManager.maps[i];
    if (!(path in added)) {
      PIXI.loader.add(path, path);
      added[path] = true;
    }
  }
  for (var i in GameManager.dialogues) {
    var path = GameManager.dialogues[i];
    if (!(path in added)) {
      PIXI.loader.add(path, path);
      added[path] = true;
    }
  }
  for (var i in SpritePool.METADATA) {
    var path = SpritePool.METADATA[i][0];
    if (!(path in added)) {
      PIXI.loader.add(path, path);
      added[path] = true;
    }
  }
  PIXI.loader.on('progress', progressCb).load(function() {
    for (var i in SpritePool.METADATA) {
      var id = SpritePool.METADATA[i][0];
      SpritePool.pool[i] = [];

      var frames = [];
      var texture = PIXI.loader.resources[id].texture;

      var nc = Math.ceil(texture.width / ASSET_TILE_SIZE);
      for (var j in SpritePool.METADATA[i][1]) {
        var id = SpritePool.METADATA[i][1][j];
        var y = Math.floor(id / nc) * ASSET_TILE_SIZE, x = (id % nc) * ASSET_TILE_SIZE;
        frames.push(new PIXI.Texture(texture, new PIXI.Rectangle(x, y, Math.min(texture.width - x, ASSET_TILE_SIZE), Math.min(texture.height - y, ASSET_TILE_SIZE))));
      }
      SpritePool.texturePool[i] = frames;

      for (var j=0; j < SpritePool.METADATA[i][2]; j++) {
        var sprite;
        if (frames.length == 1) {
          sprite = new PIXI.Sprite(frames[0]);
        } else {
          sprite = new PIXI.extras.MovieClip(frames);
          sprite.play();
        }
        sprite.anchor = new PIXI.Point(0.5, 0.5);
        sprite.visible = false;
        SpritePool.pool[i].push(sprite);
      }
    }
    doneCb();
  });
}
