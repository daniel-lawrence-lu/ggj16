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
      stage.addChild(menu);
      break;
    case 1: // game
      var game = new GameManager();
      game.on("back-to-menu", function() { transitionState(0); });
      stage.addChild(game);
      break;
  }
}

transitionState(1);
