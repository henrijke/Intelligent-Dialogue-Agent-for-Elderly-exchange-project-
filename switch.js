const Gpio = require("onoff").Gpio;

const sensorSwitch = new Gpio(21,"in","both");
const led = new Gpio(4,"out");

sensorSwitch.watch((err,value)=>{
    if(err) console.log(err);
    led.writeSync(value);
});

const unexportOnClose=()=>{
    led.writeSync(0);
    led.unexport();
    sensorSwitch.unexport();
};

process.on("SIGINT",unexportOnClose);