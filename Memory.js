function memory()

{
  var mainMem = new Uint8Array(65536);

  this.attachCartridge = function(file) {
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
         alert("Cartridge attached");
       }
       reader.readAsArrayBuffer(file);

  }

  this.readMem = function (address) {
    return mainMem[address];
  }

  this.writeMem = function (address, byteval) {
    mainMem[address] = byteval;
  }

}


