const express = require('express');
const GoogleAssistant = require('../googleassistant.js');
const deviceCredentials = require('../credentials.json');
//const https = require('https');
const Gpio = require('onoff').Gpio;

const LED = new Gpio(4,'out');
const pushButton = new Gpio(17,'in','both');

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};


const assistant = new GoogleAssistant(CREDENTIALS);

const app = express();
//const bodyParser = require('body-parser');
app.use(express.json());
//en haluu käyttää mitää enginee, tää pitää html:--)
app.use(express.static(__dirname + '/public'));

//app.use(bodyParser.json());

//  SETUP    ***********************************************************************

//  FUNCTIONS    ***********************************************************************

app.get('/',(req,res)=>{
    res.render('index', {});
});
/*
app.get('/check',(req,res)=>{
    console.log(pushButton.readSync());
    res.sendStatus(pushButton.readSync());
});
*/
app.get('/assistant',(req,res)=>{
    console.log("assistant goes ooooon");
    assistant.assist('Hello!')
        .then(({text}) =>{
            console.log(text);
            return assistant.assist("What's the weather like");
        })
        .then(({text})=>{
            console.log(text);
            res.send(text);
            return text;
        })
        .catch(err => console.log(err));
});

app.post('/message',(req,res)=>{
    console.log(req.body);
    if(req.body.checkbox === true){

        LED.writeSync(1);
    }else{
        console.log("checkbox not checked");
    }
    assistant.assist(req.body.message)
        .then(({text})=>{
           return res.send({value:text});
        });
    // res.send({value:req.body.message});
});

//  GETS & POSTS    ***********************************************************************

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening on port ${port}`));

const unexportOnClose=()=>{
    LED.writeSync(0);
    LED.unexport();
    pushButton.unexport();
};

//ctrl+c niin tekee tän
process.on('SIGINT', unexportOnClose);
