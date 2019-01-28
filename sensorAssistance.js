const GoogleAssistant = require('./googleassistant.js');
const deviceCredentials = require('./credentials.json');
const Gpio = require('onoff').Gpio;

const led = new Gpio(4,'out');
const sensor = new Gpio(27,'in','both');
let onCooldown = false;

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};

const assistant = new GoogleAssistant(CREDENTIALS);

const resetCooldown=()=>{
    onCooldown=false;
};

sensor.watch((err,value)=>{
    if(err) console.log("Sensor error",err);
    if(!onCooldown){
    console.log("Assistance turning on..");

    led.writeSync(value);
        onCooldown = true;
        assistant.assist('Hello!')
            .then(({text}) =>{
                console.log(text);
                return assistant.assist("What's the weather like");
            })
            .then(({text})=>{
                console.log(text);
                setTimeout(resetCooldown,30000);
            })
            .catch(err => console.log(err));
    }else{
        console.log("assistant on cooldown");
    }
});

const unexportOnClose=()=>{
    led.writeSync(0);
    led.unexport();
    pushButton.unexport();
    sensor.unexport();
};

process.on('SIGINT', unexportOnClose);

