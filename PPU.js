function ppu(screenCanvas) {
  var contextScreen = screenCanvas.getContext("2d");
  var screenData = contextScreen.createImageData(256, 240);
  var screenDataAsArray = screenData.data;

  this.draw = function () {
    var i;
    for (i=0; i < 2000; i = i + 4) {
      screenDataAsArray[i+0] = 255;
      screenDataAsArray[i+1] = 0;
      screenDataAsArray[i+2] = 0;
      screenDataAsArray[i+3] = 255;
    }

    contextScreen.putImageData(screenData,0,0);
  }
}
