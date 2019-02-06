var record = require('node-record-lpcm16')
var fs = require('fs');

var file = fs.createWriteStream('test1.wav', { encoding: 'binary' })

record.start().pipe(file);

// Stop recording after three seconds
setTimeout(function () {
    record.stop()
}, 3000);