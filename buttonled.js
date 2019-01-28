//GPIO otetaan käyttöön
const Gpio = require('onoff').Gpio;

//Asetetaan outputti nelkkuun
const led = new Gpio(4,'out');

//both tarkottaa että molemmilla nappuloilla handeloidaan
const pushButton = new Gpio(17,'in','both');

// watch tarkkailee muutoksia pushbuttonissa ja tekee callbakcin
pushButton.watch((err,value) => {
    if(err){
        //Jos homma hajoo niin sitten kerrotaan
        console.error('There was an error',err);
    }
    // asetetaan valon arvoksi nappulan arvo
    led.writeSync(value);
});

//Kun homma päättyy juoksutetaan tää. Sammuttaa kaiken
const unexportOnClose=()=>{
    led.writeSync(0);
    led.unexport();
    pushButton.unexport();
};

//ctrl+c niin tekee tän
process.on('SIGINT', unexportOnClose);