var STAGE_WIDTH = 640;
var STAGE_HEIGHT = 480;
var UI_HEIGHT = 160;
var APP_WIDTH = STAGE_WIDTH;
var APP_HEIGHT = STAGE_HEIGHT + UI_HEIGHT;
var renderer = PIXI.autoDetectRenderer(APP_WIDTH, APP_HEIGHT, {backgroundColor : 0xFFFF00});
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
PIXI.loader.add([
  "../assets/img/ground.png", 
  "../assets/img/player.png", 
  "../assets/img/wall.png",
  "../assets/img/start.png",
]).on('progress', progress).load(ready);

function progress(loader) {
  console.log(loader.progress);
  loadingFill.clear();
  loadingFill.beginFill(0x0000FF);
  loadingFill.drawRect(0, 0, loadingBar.width * loader.progress / 100, loadingBar.height);
}

function ready() {
  stage.removeChild(loading);
  transitionState(0);
}
