function ppu(screenCanvas) {
  var contextScreen = screenCanvas.getContext("2d");
  var screenData = contextScreen.createImageData(256, 240);
  var screenDataAsArray = screenData.data;
  var registers = new Uint8Array(8);
  var ppuMemory = new Uint8Array(65536);
  var writeCounter = 0;

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

  this.readRegister = function(address) {
    return registers[address & 7];
  }

  this.writeRegister = function(address, value) {
    registers[address & 7] = value & 0xff;
    if (address == 0x2006) {
      writeCounter = (writeCounter << 8) | (value & 0xff);
      writeCounter = writeCounter & 0xffff;
    } else if (address == 0x2007) {
      ppuMemory [writeCounter] = value;
      writeCounter++;
      writeCounter = writeCounter & 0xffff;
    }
  }
}
