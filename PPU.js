function ppu(screenCanvas) {

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
  var screenDataNameTable1 = contextScreen.createImageData(256, 240);
  var screenDataNameTable2 = contextScreen.createImageData(256, 240);
  var spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = 256;
  spriteCanvas.height = 240;

  var spriteContext = spriteCanvas.getContext("2d");
  var spriteData = spriteContext.createImageData(256, 240);
  
  var registers = new Uint8Array(8);
  var ppuMemory = new Uint8Array(65536);
  var SPR_RAM = new Uint8Array(256);
  var SPR_RAMwritePos = 0;
  var writeCounter = 0;
  const CHR_SIZE = 4 * 0x2000;
  var chrBanks = new Uint8Array(CHR_SIZE);
  var bankNumber = 0;
  var offsetCHRROM = 0;

  var scrollX = 0;
  var scrollY = 0;
  var receiveXScroll = true;

  var disgardRead = true;

  this.getPPUSpriteMemory = function() {
    return SPR_RAM;
  }

  function renderSprites() {
    var i;
    var spriteBaseAddress = registers[0] & 8 ? 0x1000 : 0;
    spriteBaseAddress = spriteBaseAddress + offsetCHRROM;
    for (i = 0; i < 256; i = i + 4) {
      var tileIndex = SPR_RAM[i+1];
      var tileBaseAddress = (tileIndex << 4) + spriteBaseAddress; 
      var j;
      var posInSpriteBuffer = SPR_RAM[i+0] << 10;
      var spriteXPos = SPR_RAM[i+3] << 2;
      for (j = 0; j < 8; j++) {
        var pixelData1 = chrBanks[tileBaseAddress + j];
        var pixelData2 = chrBanks[tileBaseAddress + j + 8];
        var pixelNum;
        var posForSpriteLine = posInSpriteBuffer + spriteXPos;
        for (pixelNum = 0; pixelNum < 8; pixelNum++) {
          var pixelBit1 = pixelData1 & 128 ? 1 : 0;
          var pixelBit2 = pixelData2 & 128 ? 1 : 0;
          var colorPalletteEntryNum = SPR_RAM[i+2] & 3;
          colorPalletteEntryNum = colorPalletteEntryNum << 2;
          colorPalletteEntryNum = colorPalletteEntryNum | (pixelBit2 << 1) | pixelBit1;
          var entryToSystemPallette = ppuMemory[0x3f10 + colorPalletteEntryNum] & 0x1f;
          if (colorPalletteEntryNum & 3) {
            spriteData.data[posForSpriteLine + 0] = colors[entryToSystemPallette][0];
            spriteData.data[posForSpriteLine + 1] = colors[entryToSystemPallette][1];
            spriteData.data[posForSpriteLine + 2] = colors[entryToSystemPallette][2];
            spriteData.data[posForSpriteLine + 3] = 255;
          }
          pixelData1 = pixelData1 << 1;
          pixelData2 = pixelData2 << 1;    
          posForSpriteLine = posForSpriteLine + 4;
        }
        posInSpriteBuffer = posInSpriteBuffer + 1024;
      }

    }
  }

  function renderNameTable(baseAddress, dataArray) {
    var line = 0;
    var posinbuf = 0;
    var currentTextLinePos = baseAddress;
    var attributeBaseAddress = baseAddress + 0x3c0;

    for (line = 0; line < 240; line++) {
      if ((line > 0) && !(line & 7)) {
        currentTextLinePos = currentTextLinePos + 32;
      }
      var currentCharPos = 0;
      var charPosInLine = 0;
      for (currentCharPos = currentTextLinePos; currentCharPos < (currentTextLinePos + 32); currentCharPos++) {
        var tileNumber = ppuMemory[currentCharPos];
        var pixelNum = 0;
        var pixelData = chrBanks[0x1000 + offsetCHRROM + (tileNumber << 4) + (line & 7) ];
        var pixelData2 = chrBanks[0x1000 + offsetCHRROM + (tileNumber << 4) + (line & 7) + 8 ];
        var col8x8 = charPosInLine >> 2;
        var row8x8 = line >> 5;
        var linear8x8 = (row8x8 << 3) + col8x8;
        var attributeByte = ppuMemory[attributeBaseAddress + linear8x8];
        
        var colInCell = (charPosInLine & 3) >> 1;
        var rowInCell = (line & 31) >> 4;
        var linearCell = (rowInCell << 1) + colInCell;
        //attributeByte = attributeByte >> ((3 - linearCell) << 1);
        attributeByte = attributeByte >> ((linearCell) << 1);
        attributeByte = attributeByte & 3;
        attributeByte = attributeByte << 2;

        for (pixelNum = 0; pixelNum < 8; pixelNum++) {
          var pixelBit1 = (pixelData & 128) ? 1 : 0;
          var pixelBit2 = (pixelData2 & 128) ? 1 : 0;
          var entryNum = (pixelBit2 << 1) | pixelBit1;
          entryNum = entryNum | attributeByte;
          var paletteEntryNum = ppuMemory[0x3f00 + entryNum] & 0x7f;
          dataArray[posinbuf+0] = colors[paletteEntryNum][0];
          dataArray[posinbuf+1] = colors[paletteEntryNum][1];
          dataArray[posinbuf+2] = colors[paletteEntryNum][2];
          dataArray[posinbuf+3] = 255;
          posinbuf = posinbuf + 4;
          pixelData = pixelData << 1;          
          pixelData2 = pixelData2 << 1;          
        }
        charPosInLine++;
      }
    }

  }

  this.draw2 = function() {
    renderNameTable(0x2000, screenDataNameTable1.data);
    renderNameTable(0x2800, screenDataNameTable2.data);
    //contextScreen.putImageData(screenDataNameTable1,-scrollX,-scrollY); //0
    //contextScreen.putImageData(screenDataNameTable1, 256-scrollX, -scrollY); //1
    //contextScreen.putImageData(screenDataNameTable2,-scrollX,240-scrollY); //2
    //contextScreen.putImageData(screenDataNameTable2,256-scrollX,240-scrollY); //3

    var firstNameTable = registers[0] & 3;
    var firstScreenToDraw;
    var secondScreenToDraw;
    if (firstNameTable == 2) {
      firstScreenToDraw = screenDataNameTable2;
      secondScreenToDraw = screenDataNameTable1;
    } else {
      firstScreenToDraw = screenDataNameTable1;
      secondScreenToDraw = screenDataNameTable2;

    }

    contextScreen.putImageData(firstScreenToDraw,-scrollX,-scrollY); //0
    contextScreen.putImageData(firstScreenToDraw, 256-scrollX, -scrollY); //1
    contextScreen.putImageData(secondScreenToDraw,-scrollX,240-scrollY); //2
    contextScreen.putImageData(secondScreenToDraw,256-scrollX,240-scrollY); //3
    //If Sprites is enabled display them
    if (registers[0x1] &  0x10) {
      var i;
      for (i = 0; i < 245760; i++) {
        spriteData.data[i] = 0;
      }

      renderSprites();
      spriteContext.putImageData(spriteData,0,0);
      contextScreen.drawImage(spriteCanvas,0,0);
    }

   

    contextScreen.fillStyle="#FFFFFF";
    contextScreen.fillRect(0,0,7,249);    

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
    if (address == 0x2007) {
      if (disgardRead) {
        disgardRead = false;
        return 0;
      }
      var temp = ppuMemory[writeCounter];
      writeCounter++;
      return temp;
    }
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
      disgardRead = true; 
    } else if (address == 0x2007) {
      ppuMemory [writeCounter] = value;
      var increment = registers[0] & 4 ? 32 : 1;
      writeCounter = writeCounter + increment;
      writeCounter = writeCounter & 0xffff;
    } else if (address == 0x2005) {
      if (receiveXScroll)
        scrollX = value;
      else
        scrollY = value;
      receiveXScroll = !receiveXScroll;
    } else if (address == 0x2003) {
      SPR_RAMwritePos = value;
    } else if (address == 0x2004) {
      SPR_RAM [SPR_RAMwritePos] = value;
    } 
  }
}
