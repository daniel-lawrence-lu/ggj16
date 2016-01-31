function SpritePool() {}

SpritePool.GROUND = 0;
SpritePool.WALL = 1;
SpritePool.CONVEYOR = 2;
SpritePool.PLAYER_UP = 3;
SpritePool.PLAYER_DOWN = 4;
SpritePool.PLAYER_SIDE = 5;

// FORMAT: [path, start_frame, end_frame_excl, max_instances]
SpritePool.METADATA = [];
var MAX_TILES = (Math.ceil(STAGE_WIDTH / TILE_SIZE) + 1) * (Math.ceil(STAGE_HEIGHT / TILE_SIZE) + 1);
SpritePool.METADATA[SpritePool.GROUND] = ["../assets/img/ground.png", 0, 1, MAX_TILES]; 
SpritePool.METADATA[SpritePool.WALL] = ["../assets/img/wall.png", 0, 1, MAX_TILES]; 
SpritePool.METADATA[SpritePool.CONVEYOR] = ["../assets/img/conveyor.png", 0, 32, MAX_TILES]; 
SpritePool.METADATA[SpritePool.PLAYER_UP] = ["../assets/img/robot.png", 0, 1, 0]; 
SpritePool.METADATA[SpritePool.PLAYER_DOWN] = ["../assets/img/robot.png", 1, 2, 0]; 
SpritePool.METADATA[SpritePool.PLAYER_SIDE] = ["../assets/img/robot.png", 2, 3, 0]; 

SpritePool.texturePool = {};
SpritePool.pool = {};
SpritePool.idx = {};
SpritePool.getTextures = function(sprite) {
  var frames = SpritePool.texturePool[sprite];
  return frames.length == 1 ? frames[0] : frames;
}
SpritePool.getSprite = function(sprite) {
  if (!(sprite in SpritePool.idx)) {
    SpritePool.idx[sprite] = -1;
  }
  var pool = SpritePool.pool[sprite];
  return pool[(++SpritePool.idx[sprite]) % pool.length];
}

SpritePool.preload = function(progressCb, doneCb) {
  for (var i in GameManager.maps) {
    PIXI.loader.add(GameManager.maps[i], GameManager.maps[i]);
  }
  for (var i in GameManager.dialogues) {
    PIXI.loader.add(GameManager.dialogues[i], GameManager.dialogues[i]);
  }
  for (var i in SpritePool.METADATA) {
    PIXI.loader.add(i, SpritePool.METADATA[i][0]);
  }
  PIXI.loader.on('progress', progressCb).load(function() {
    for (var i in SpritePool.METADATA) {
      SpritePool.pool[i] = [];

      var frames = [];
      var texture = PIXI.loader.resources[i].texture;

      var nc = Math.ceil(texture.width / ASSET_TILE_SIZE);
      for (var j = SpritePool.METADATA[i][1]; j < SpritePool.METADATA[i][2]; j++) {
        var y = Math.floor(j / nc) * ASSET_TILE_SIZE, x = (j % nc) * ASSET_TILE_SIZE;
        frames.push(new PIXI.Texture(texture, new PIXI.Rectangle(x, y, Math.min(texture.width - x, ASSET_TILE_SIZE), Math.min(texture.height - y, ASSET_TILE_SIZE))));
      }
      SpritePool.texturePool[i] = frames;

      for (var j=0; j < SpritePool.METADATA[i][3]; j++) {
        var sprite;
        if (frames.length == 1) {
          sprite = new PIXI.Sprite(frames[0]);
        } else {
          sprite = new PIXI.extras.MovieClip(frames);
          sprite.animationSpeed = 0.2;
          sprite.play();
        }
        sprite.anchor = new PIXI.Point(0.5, 0.5);
        SpritePool.pool[i].push(sprite);
      }
    }
    doneCb();
  });
}
