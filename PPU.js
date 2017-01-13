function ppu(screenCanvas) {
  var contextScreen = screenCanvas.getContext("2d");
  var screenData = contextScreen.createImageData(256, 240);
  var screenDataAsArray = screenData.data;
  var registers = new Uint8Array(8);
  var ppuMemory = new Uint8Array(65536);
  var writeCounter = 0;

  this.draw = function () {
    var i;
    var j;
    var posinbuf = 0;
    var offset = 315 * 16;
    for (i=0 + offset; i < (32 * 16) + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=1 + offset; i < (32 * 16) + 1 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=2 + offset; i < (32 * 16) + 2 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=3 + offset; i < (32 * 16) + 3 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=4 + offset; i < (32 * 16) + 4 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=5 + offset; i < (32 * 16) + 5 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=6 + offset; i < (32 * 16) + 6 + offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }

    for (i=7 + offset; i < (32 * 16) + 7 +offset; i = i + 16) {
        var data = ppuMemory[i];
        var pixels;
        for (pixels = 0; pixels < 8; pixels++) {
          if (data & 128) {
            screenDataAsArray[posinbuf+0] = 0;
            screenDataAsArray[posinbuf+1] = 0;
            screenDataAsArray[posinbuf+2] = 0;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;
          } else {
            screenDataAsArray[posinbuf+0] = 255;
            screenDataAsArray[posinbuf+1] = 255;
            screenDataAsArray[posinbuf+2] = 255;
            screenDataAsArray[posinbuf+3] = 255;
            posinbuf = posinbuf + 4;

          }
   
          data = data << 1;
        }

    }
 

    contextScreen.putImageData(screenData,0,0);
  }

  this.readRegister = function(address) {
    return registers[address & 7];
  }

  this.initFromCartridgeData = function (data) {
    //Skip header
    var pos = 0x10;
    //Skip 2X prog ROM
    pos += 0x8000;
    var i = 0;
    for (i = 0; i < 0x2000; i++) {
      ppuMemory[i] = data[pos];
      pos++;
    }
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
