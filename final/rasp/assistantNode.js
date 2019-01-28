// setup
const GoogleAssistant = require('./googleassistant.js');
const credentials = require('./cred/credentials.js');
const Gpio = require('onoff').Gpio;
const fetch = require('node-fetch');

// Setting the Gpio parts
const led = new Gpio(4,'out');
const ledSecond = new Gpio(20,'out');
const ledThird = new Gpio(16,'out');
const sensor = new Gpio(27,'in','both');
const pushButton = new Gpio(17,'in','falling');
const sensorSwitch = new Gpio(21,'in','both');
let sensorWatch = 0;

// Setting the Google Assistant
const assistant = new GoogleAssistant(credentials);

// Switch to turn on sensor, led shows that the sensor is on
sensorSwitch.watch((err,value)=>{
    if(err) console.log("Switch error",err);
    led.writeSync(value);
    sensorWatch = value;
});

// Sensor that starts Assistant when movement is detected
sensor.watch((err,value)=>{
    if(err) console.log("Sensor error",err);
    if(sensorWatch===1){
        assistant.assist('Hello!')
            .then(({text}) =>{
                console.log(text);
                //return assistant.assist("What's the weather like");
            })
            .catch(err => console.log(err));
    }
});
/*
const io = require('socket.io-client');
const socket = io.connect('https://nodeassistant-9f5ff.firebaseapp.com',{reconnect: true});
socket.on('connect',(socket)=>{
    console.log('Connected');
});
*/

const blink = ()=>{
    if(ledSecond.readSync() === 0){
        ledSecond.writeSync(1);
        ledThird.writeSync(0);
    }else{
        ledSecond.writeSync(0);
        ledThird.writeSync(1);
    }
};

const endBlink = (blinkInt)=>{
    clearInterval(blinkInt);
    ledSecond.writeSync(0);
    ledThird.writeSync(0);
};

const fetchData = {
  method: "POST",
  body:JSON.stringify({
      userId: "salasana"
  }),
  headers: {'Content-Type': 'application/json'}
};

// Button that starts Assistant
pushButton.watch((err,value)=>{
    if(err) console.log("Button error",err);
    // Käytetään Nappulaa nyt pohjana sockettt shitille
    console.log("tehdään fetch");
    const blinkInt = setInterval(blink,330);

    fetch('https://nodeassistant-9f5ff.firebaseapp.com/test',fetchData)
        .then(data => data.json())
        .then((resp)=>{
           console.log(resp);
           endBlink(blinkInt);
           led.writeSync(resp.led);
        }).catch(err=>console.log(err));

    /*
    assistant.assist('Hello!')
        .then(({text})=>{
            console.log(text);
        })
        */
});

// When closing the app turn off the gpio
const unexportOnClose=()=>{
    led.writeSync(0);
    ledThird.writeSync(0);
    ledSecond.writeSync(0);
    led.unexport();
    ledThird.unexport();
    ledSecond.unexport();
    pushButton.unexport();
    sensorSwitch.unexport();
    sensor.unexport();
};

// When ctrl+C is pressed run the unexportOnClose function
process.on('SIGINT', unexportOnClose);