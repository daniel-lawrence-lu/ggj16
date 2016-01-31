function Dialogue(data, doneCb, timeout) {
  PIXI.Container.call(this);

  var instance = this;
  instance.text = new PIXI.Text("", {fill: 0x0000FF, wordWrap: true, wordWrapWidth: APP_WIDTH});
  instance.addChild(instance.text);

  instance.content = [];
  instance.page = -1;
  instance.doneCb = doneCb;

  instance.close = function() {
    window.removeEventListener("mousedown", checkKey);
    window.removeEventListener("keydown", checkKey);
    instance.parent.removeChild(instance);
    instance.doneCb();
  }

  instance.advance = function() {
    instance.page++;
    if (instance.page >= instance.content.length) {
      instance.close();
      return;
    }
    instance.text.text = instance.content[instance.page];
  }
  
  instance.x = data.x;
  instance.y = data.y;
  instance.content = data.content;
  instance.page = -1;

  if(timeout) {
    setTimeout(instance.close, timeout);
  } else {
    var checkKey = function(evt) {
      if (evt.altKey || evt.metaKey || evt.ctrlKey) return;
      if (evt.button == 0 || evt.keyCode == 32 /*space*/ || evt.keyCode == 13 /*enter*/) {
        instance.advance();
        evt.preventDefault(); 
      }
    }

    window.addEventListener("mousedown", checkKey);
    window.addEventListener("keydown", checkKey);

    var instruction = new PIXI.Text("Press space to continue...", {font: "14pt sans serif", fill: 0xFFFFFF});
    instruction.x = APP_WIDTH - instruction.width - 10;
    instruction.y = 80;
    instance.addChild(instruction);
  }

  instance.advance();
}
Dialogue.prototype = Object.create(PIXI.Container.prototype);
Dialogue.prototype.constructor = Dialogue;
Dialogue.showDialogue = function(json, doneCb, timeout) {
  return new Dialogue(PIXI.loader.resources[json].data, doneCb, timeout);
}

