function memory(ppu)

{
  var mainMem = new Uint8Array(65536);
  var localPPU = ppu;

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
    if ((address >= 0x2000)  & (address < 0x2008))
      return localPPU.readRegister(address)
    else
      return mainMem[address];
  }

  this.writeMem = function (address, byteval) {
    //if ((address >= 0x2000) & (address != 0x2002))
    //  console.log("Write " + address.toString(16) + " " + byteval.toString(16));
    if (address >= 0x8000)
      return;
    if ((address >= 0x2000)  & (address < 0x2008))
      localPPU.writeRegister(address, byteval)
    else
      mainMem[address] = byteval;
  }

}


