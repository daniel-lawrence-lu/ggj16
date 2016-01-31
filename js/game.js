var renderer = PIXI.autoDetectRenderer(APP_WIDTH, APP_HEIGHT, {backgroundColor : 0xFFFF00}, false, true);
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
      menu.on("start-game", function() { transitionState(1); });
      stage.addChild(menu);
      break;
    case 1: // game
      var game = new GameManager();
      game.on("back-to-menu", function() { transitionState(0); });
      game.play();
      stage.addChild(game);
      break;
  }
}

var loading = new PIXI.Container();
stage.addChild(loading);

var loadingText = new PIXI.Text("Loading...");
loadingText.x = 200;
loadingText.y = 300;
loading.addChild(loadingText);

var loadingFill = new PIXI.Graphics();
loadingFill.x = 200;
loadingFill.y = 340;

var loadingBar = PIXI.Sprite.fromImage("../assets/img/loadingBar.png");
loadingBar.x = loadingFill.x;
loadingBar.y = loadingFill.y;
loading.addChild(loadingBar);
loading.addChild(loadingFill);

// preload
SpritePool.preload(progress, ready);

function progress(loader) {
  loadingFill.clear();
  loadingFill.beginFill(0x0000FF);
  loadingFill.drawRect(0, 0, loadingBar.width * loader.progress / 100, loadingBar.height);
}

function ready() {
  stage.removeChild(loading);
  transitionState(0);
}
