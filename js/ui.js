function UI() {
  PIXI.Container.call(this);

  var g = new PIXI.Graphics();
  g.beginFill(0xD2B48C);
  g.drawRect(0, 0, APP_WIDTH, UI_HEIGHT);
  this.addChild(g);
}
UI.prototype = Object.create(PIXI.Container.prototype);
UI.prototype.constructor = UI;
