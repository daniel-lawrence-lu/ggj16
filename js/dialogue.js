function Dialogue() {
  PIXI.Container.call(this);

  var instance = this;
  instance.text = new PIXI.Text("", {fill: 0x0000FF});
  instance.addChild(instance.text);

  instance.content = [];
  instance.page = -1;
  instance.doneCb = function(){};
  instance.advance = function() {
    instance.page++;
    if (instance.page >= instance.content.length) {
      window.removeEventListener("mousedown", checkKey);
      window.removeEventListener("keydown", checkKey);
      instance.parent.removeChild(instance);
      instance.doneCb();
      return;
    }
    instance.text.text = instance.content[instance.page];
  }

  var checkKey = function(evt) {
    if (evt.altKey || evt.metaKey || evt.ctrlKey) return;
    if (evt.button == 0 || evt.keyCode == 32 /*space*/ || evt.keyCode == 13 /*enter*/) {
      instance.advance();
      evt.preventDefault(); 
    }
  }

  instance.setData = function(data, doneCb) {
    instance.x = data.x;
    instance.y = data.y;
    instance.content = data.content;
    instance.page = -1;
    instance.doneCb = doneCb;

    window.addEventListener("mousedown", checkKey);
    window.addEventListener("keydown", checkKey);

    instance.advance();
  }
}
Dialogue.prototype = Object.create(PIXI.Container.prototype);
Dialogue.prototype.constructor = Dialogue;
Dialogue.showDialogue = function(json, doneCb) {
  var d = new Dialogue();
  var dialogueLoaded = function(loader) {
    var data = loader.resources["dialogue"].data;
    d.setData(data, doneCb);
  }
  PIXI.loader.add("dialogue", json).load(dialogueLoaded);
  return d;
}

