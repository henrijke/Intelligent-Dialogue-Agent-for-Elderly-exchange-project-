const Gpio = require('onoff').Gpio;
//asetetaan GPIO pin 4, määrittely output
const LED = new Gpio(4,'out');

const blinkLED = ()=>{
    //Katsotaan pinnin status
    if(LED.readSync()===0){
        //vaihetaan pinnin status
        LED.writeSync(1);
    }else{
        LED.writeSync(0);
    }
};
// laitetaan blinkLED funktio aina 2,5 sek välein
const blinkInterval = setInterval(blinkLED,250);

//funktio joka lopettaa vilkuilun
const endBlink=()=>{
    clearInterval(blinkInterval);
    LED.writeSync(0);
    LED.unexport();
};

setTimeout(endBlink,5000);