function MainMenu() {
  PIXI.Container.call(this);

  var instance = this;
  var button = PIXI.Sprite.fromImage("../assets/img/bot.png");
  button.x = 0; //APP_WIDTH/2 - button.width/2;
  button.y = 0; //APP_HEIGHT/2 - button.height/2;
  button.interactive = true;
  button.click = function() {
    instance.emit("start-game");
  }
  instance.addChild(button);
}
MainMenu.prototype = Object.create(PIXI.Container.prototype);
MainMenu.prototype.constructor = MainMenu;
