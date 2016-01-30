var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 600;
var renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, {backgroundColor : 0xFFFF00});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

PIXI.ticker.shared.add(function() {
  renderer.render(stage);
});

function transitionState(state) {
  stage.removeChildren();
  switch(state) {
    case 0: // main menu
      var menu = new MainMenu();
      // TODO: add start btn or something
      menu.on("start-game", function() { transitionState(1); });
      stage.addChild(menu);
      break;
    case 1: // game
      var game = new GameManager();
      game.on("back-to-menu", function() { transitionState(0); });
      stage.addChild(game);
      break;
  }
}

// preload
PIXI.loader.add([
  "../assets/img/ground.png", 
  "../assets/img/player.png", 
  "../assets/img/wall.png",
]).load(start); 

function start() {
  transitionState(1);
}
