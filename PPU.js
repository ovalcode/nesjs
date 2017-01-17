function ppu(screenCanvas) {

  const screenNum = [
    //// col > 31  line > 239
    0x2000,//00
    0x2400,//01
    0x2000,//10
    0x2400,//11
    
];


  const colors = [
[124,124,124],
[0,0,252],
[0,0,188],
[68,40,188],
[148,0,132],
[168,0,32],
[168,16,0],
[136,20,0],
[80,48,0],
[0,120,0],
[0,104,0],
[0,88,0],
[0,64,88],
[0,0,0],
[0,0,0],
[0,0,0],
[188,188,188],
[0,120,248],
[0,88,248],
[104,68,252],
[216,0,204],
[228,0,88],
[248,56,0],
[228,92,16],
[172,124,0],
[0,184,0],
[0,168,0],
[0,168,68],
[0,136,136],
[0,0,0],
[0,0,0],
[0,0,0],
[248,248,248],
[60,188,252],
[104,136,252],
[152,120,248],
[248,120,248],
[248,88,152],
[248,120,88],
[252,160,68],
[248,184,0],
[184,248,24],
[88,216,84],
[88,248,152],
[0,232,216],
[120,120,120],
[0,0,0],
[0,0,0],
[252,252,252],
[164,228,252],
[184,184,248],
[216,184,248],
[248,184,248],
[248,164,192],
[240,208,176],
[252,224,168],
[248,216,120],
[216,248,120],
[184,248,184],
[184,248,216],
[0,252,252],
[248,216,248],
[0,0,0],
[0,0,0]
];

  var contextScreen = screenCanvas.getContext("2d");
  var screenData = contextScreen.createImageData(256, 240);
  var screenDataAsArray = screenData.data;
  var registers = new Uint8Array(8);
  var ppuMemory = new Uint8Array(65536);
  var writeCounter = 0;
  const CHR_SIZE = 4 * 0x2000;
  var chrBanks = new Uint8Array(CHR_SIZE);
  var bankNumber = 0;
  var offsetCHRROM = 0;
  var scrollLatch = 0;
  var scrollX = 0;
  var scrollY = 0;

  this.draw2 = function() {
    var line = 0;
    var posinbuf = 0;
    var currentTextLinePos = (scrollY << 3) & 0xfff8;
    var charLineOffSet = scrollX >> 3;
//    var  = 0;
    
    for (line = scrollY; line < (240 + scrollY); line++) {
      var col = 0;
      if ((line > scrollY) && !(line & 7)) {
        currentTextLinePos = currentTextLinePos + 64;
      }
      var currentCharPos = 0;
      var charPosInLine = 0;
      for (currentCharPos = currentTextLinePos; currentCharPos < (currentTextLinePos + 64); currentCharPos++) {
        col = col & 31;
        //currentTextLinePos >> 1;
        //currentCharPos & 31;
        //which screen???
        // col > 31  line > 239
        // 
        //lookup table
        var colBigger31 = col > 31 ? 1 : 0;
        var rowBigger239 = line > 239 ? 1 : 0;
        var screenLookupKey = (colBigger31 << 1) | rowBigger239;
        var screenbaseAddress = screenNum[screenLookupKey];   
        var currentCharAccumalated = currentTextLinePos >> 1;
        if  (currentCharAccumalated > 959)  
          currentCharAccumalated = currentCharAccumalated - 960;

        var tileNumber = ppuMemory[currentCharAccumalated + col + screenbaseAddress];
        var pixelNum = 0;
        var pixelData = chrBanks[0x1000 + offsetCHRROM + (tileNumber << 4) + (line & 7) ];
        var pixelData2 = chrBanks[0x1000 + offsetCHRROM + (tileNumber << 4) + (line & 7) + 8 ];
        var col8x8 = col >> 2;
        var row8x8 = line > 239 ? ((line - 240) >> 3) : (line >> 3);
        var linear8x8 = (row8x8 << 3) + col8x8;
        var attributeByte = ppuMemory[0x23c0 + linear8x8];
        
        var colInCell = (charPosInLine & 3) >> 1;
        var rowInCell = (line & 31) >> 4;
        var linearCell = (rowInCell << 1) + colInCell;
        attributeByte = attributeByte >> ((3 - linearCell) << 1);
        //attributeByte = attributeByte >> ((linearCell) << 1);
        attributeByte = attributeByte & 3;
        attributeByte = attributeByte << 2;

        for (pixelNum = 0; pixelNum < 8; pixelNum++) {
          var pixelBit1 = (pixelData & 128) ? 1 : 0;
          var pixelBit2 = (pixelData2 & 128) ? 1 : 0;
          var entryNum = (pixelBit2 << 1) | pixelBit1;
          entryNum = entryNum | attributeByte;
          var paletteEntryNum = ppuMemory[0x3f00 + entryNum] & 0x7f;
          screenDataAsArray[posinbuf+0] = colors[paletteEntryNum][0];
          screenDataAsArray[posinbuf+1] = colors[paletteEntryNum][1];
          screenDataAsArray[posinbuf+2] = colors[paletteEntryNum][2];
          screenDataAsArray[posinbuf+3] = 255;
          posinbuf = posinbuf + 4;
          pixelData = pixelData << 1;          
          pixelData2 = pixelData2 << 1;          
        }
        charPosInLine++;
        col++;
      }
    }

    contextScreen.putImageData(screenData,0,0);
  }

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
    for (i = 0; i < CHR_SIZE; i++) {
      chrBanks[i] = data[pos];
      pos++;
    }
  }

  this.setROMBank = function (bankNumber_local) {
    bankNumber = bankNumber_local & 0xf;
    offsetCHRROM = bankNumber * 0x2000;
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
    } else if (address == 0x2005) {
      if (scrollLatch == 0) {
        scrollX = value;
      } else {
        scrollY = value;
      } 
      scrollLatch = ~scrollLatch & 1;      
    }
  }
}
