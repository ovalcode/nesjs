function memory(ppu)

{
  var mainMem = new Uint8Array(65536);
  var localPPU = ppu;

  var controllerButtons = 0;
  var controllerShiftRegister = 0;

  this.onkeydown = function(event) {
    if (event.keyCode == 65)
      controllerButtons = controllerButtons | 0x20;
    else if (event.keyCode == 66)
      controllerButtons = controllerButtons | 0x10;
  }

  this.onkeyup = function(event) {
    if (event.keyCode == 65)
      controllerButtons = controllerButtons & 0xdf;
    else if (event.keyCode == 66)
      controllerButtons = controllerButtons & 0xef;
  }

  this.attachCartridge = function(file, cpu) {
       var reader = new FileReader();
       reader.onload = function(e) {
         var arrayBuffer = reader.result;
         var cartridgeData = new Uint8Array(arrayBuffer);
         var i = 0;
         var posInData = 0x10;
         for (i = 0x8000; i < 0x10000; i++) {
           mainMem[i] = cartridgeData[posInData];
           posInData++;
         }
         cpu.reset();
         localPPU.initFromCartridgeData(cartridgeData);
         alert("Cartridge attached");
       }
       reader.readAsArrayBuffer(file);

  }

  this.readMem = function (address) {
    //if ((address > 0x2000)  & (address < 0x8000))
    //  console.log("Read " + address.toString(16));
    var temp = 0;
    if ((address >= 0x2000)  & (address < 0x2008))
      return localPPU.readRegister(address)
    else if ((address == 0x4016)) {
      if (!(mainMem[0x4016] & 1)) {
        temp = (controllerShiftRegister & 128) ? 0x41 : 0x40;
        controllerShiftRegister = (controllerShiftRegister << 1) & 0xff;
      } else {
        temp = (controllerButtons & 128) ? 0x41 : 0x40;
      }
      return temp;
    }
    else if ((address == 0x4017)) {
        return 0;
    }
    else
      return mainMem[address];
  }

  this.writeMem = function (address, byteval) {
    //if ((address >= 0x2000) & (address != 0x2002))
    //  console.log("Write " + address.toString(16) + " " + byteval.toString(16));
    if (address >= 0x8000)
      localPPU.setROMBank(byteval);
    if ((address >= 0x2000)  & (address < 0x2008))
      localPPU.writeRegister(address, byteval)
    else if (address == 0x4016) {
      if (!(mainMem[0x4016] & 1))
        controllerShiftRegister = controllerButtons;
    } else if (address == 0x4014) {
      var cpuMemPos = byteval << 8;
      var ppuMem = localPPU.getPPUSpriteMemory();
      var i = 0;
      for (i = 0; i < 256; i++) {
        ppuMem[i] = mainMem[cpuMemPos + i];
      }
    }
    else
      mainMem[address] = byteval;
  }

}


