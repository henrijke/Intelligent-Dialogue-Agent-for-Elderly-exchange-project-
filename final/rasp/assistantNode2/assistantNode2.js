'use strict';

// ******************************************** Requirements *******
const credentials = require('./cred/credentials.js');
// Implement the Gpio parts
const Gpio = require('onoff').Gpio;
// Node doesn't have fetch as a default
const fetch = require('node-fetch');
// Node record/streaming library
const record = require('node-record-lpcm16');
// Node speaker and speaker helper
const Speaker = require('speaker');
const speakerHelper = require('./speaker-helper');
// path module providies utilities for working with files and directories
const path = require('path');
// Implement the Google Assistant library
const GoogleAssistant = require('google-assistant');
// Console input
const readline = require('readline');
// Firebase SDK
const firebase = require('firebase');
const fireConfig = require('./cred/firebase_credentials.js');
// firebase author creds
const userCred = require('./cred/loginCredentials.js');

// ********************************************** Setup ****

// Setting the Gpio parts
const ledFirst = new Gpio(4,'out');
const ledSecond = new Gpio(20,'out');
const ledThird = new Gpio(16,'out');
const sensor = new Gpio(27,'in','both');
const pushButton = new Gpio(17,'in','falling');
const sensorSwitch = new Gpio(21,'in','both');

// Changing variables
// Value for following what is the current value of the sensor (on / off)
let sensorWatch = 0;
// safeToStart checks if the authentication is ready
let safeToStart= false;
// ledValue is the current value of the led
let ledValue = 0;
// Is the switch on or off
let switchValue = 0;
// Is the sensor currently in use
let inUse = false;
// User's data
let user = {};
const userData = {
    online: false,
    sensor: false,
    alarm: "",
    input:{
        request:"none",
        response:"none"
    },
    output:[
        // { user: false, message: ""}
    ]
};

// Google Assistant authorization configurations
const config = {
    auth: {
        keyFilePath: path.resolve(__dirname, './cred/client_secret_546706549164-2rrvdffdmtlkt8duvdee9gv4ch3b1n9a.apps.googleusercontent.com.json'),
        savedTokensPath: path.resolve(__dirname, 'tokens.json'), // where you want the tokens to be saved
    },
    conversation: {
        audio: {
            sampleRateOut: 24000,
        },
        lang: 'en-US',
    },
};
// Firebase configuration and setup firestore database
firebase.initializeApp(fireConfig);
const database = firebase.firestore();
// Create a new GoogleAssistant class
const assistant = new GoogleAssistant(config.auth);

// Function that handles the conversation with the assistant
const startConversation = (conversation) => {
    let openMicAgain = false;
    console.log("Assistant is ready speak your mind!");
    writeData("conversationStart","");
    conversation
    // When audio comes back from the api
        .on('audio-data', (data) => {
            // sends the audio to the speaker
            speakerHelper.update(data);
        })
        // What happens when user stops speaking
        .on('end-of-utterance', () => {
            // closes the mic
            record.stop();
            // turns off led
            //ledFirst.writeSync(0);
        })
        // What happens with the transcript of the users utterance
        .on('transcription', data =>{
            //data.done is a boolean telling if the user ended the sentence
            if(data.done){
                console.log(`Finished sentence: ${data.transcription}`);
                writeData("userUtterance",data.transcription);
                //console.log('Transcription:', data.transcription, ' --- Done:', data.done)
            }else{
                // console logs whats user has said so far
                console.log(`${data.transcription}...`);
            }
        })
        // what the assistant said back
        .on('response', text => {
            console.log('Assistant Text Response:', text);
            writeData("assistantResponse",text);
            //TODO Make a fetch to the firebase mby?
        })
        // what happens when the current conversation is ending
        .on('ended', (error, continueConversation) => {
            // report any errors
            if (error) console.log('Conversation Ended Error:', error);
            // check if assistant wants to continue the conversation
            else if (continueConversation) openMicAgain = true;
            // else just end it
            else{
                console.log('Conversation Complete');
                writeData("conversationEnd","");
                inUse = false;
                //ledFirst.writeSync(0);
            }
        })
        // catch any errors
        .on('error', (error) => {
            console.log('Conversation Error:', error);
        });

    // pass the mic audio to the assistant
    const mic = record.start({ threshold: 0, recordProgram: "arecord", device: "plughw:1,0" });
    mic.on('data', data => conversation.write(data));

    // setup the speaker
    const speaker = new Speaker({
        channels: 1,
        sampleRate: config.conversation.audio.sampleRateOut,
    });
    speakerHelper.init(speaker);
    // Speaker events
    speaker
        .on('open', () => {
            console.log('Assistant Speaking');
            speakerHelper.open();
        })
        .on('close', () => {
            console.log('Assistant Finished Speaking');
            if (openMicAgain) assistant.start(config.conversation);
        });
};
// Set the assistant with the connection and determine what will happen
assistant
    // When the connection is made
    .on('ready', () => {
        safeToStart = true;
    })
    // When assistant is started
    .on('started',startConversation)
    // When error happens
    .on('error', (error) => {
        console.log('Assistant Error:', error);
    });

// ************************************** Functions ****

const createNewUser = (email, password)=>{
    return firebase.auth().createUserWithEmailAndPassword(email,password)
        .then(req => console.log("New user created!"))
        .catch(err=>{
            console.log(err);
            resolve(err);
        });
};
const loginUser = (email,password) =>{
    return firebase.auth().signInWithEmailAndPassword(email,password)
        .then(req =>{
            //console.log(req);
            return true;
        })
        .catch(err=>{
            console.log(err);
            return(err);
        });
};

const loginWithCreds = ()=>{
    console.log("Logging in with credentials");
    loginUser(userCred.email,userCred.password).then(req => {
        if (req === true){
            console.log("Logged in!");
            const authUser = firebase.auth().currentUser;
            const user = {
               // name: authUser.displayName,
                email: authUser.email,
               // photoUrl: authUser.photoUrl,
                userId: authUser.uid
            };
            setUserData(user);

        }else{
            console.log("Something is wrong");
        }
    });
};

const setUserData = (data)=>{
    user = data;
};
const dbWrite = (data) =>{
    if(firebase.auth().currentUser.uid != null){
        database.collection('users').doc(firebase.auth().currentUser.uid).set(data
        ).then((docRef)=>{
            console.log('Document written with id');
            //console.log(docRef);
        }).catch(err=>console.log(err));
    }
};

const writeData = (datatype, data)=>{
    switch(datatype){
        case "online":
            userData.online = data;
            break;
        case "sensor":
            userData.sensor = data;
            break;
        case "userUtterance":
            userData.output.push({
                user: "user",
                message: data
            });
            break;
        case "assistantResponse":
            userData.output.push({
                user: "assistant",
                message: data
            });
            break;
        case "shutdown":
            userData.sensor = false;
            userData.online = false;
            break;
        case "conversationStart":
            userData.output.push({
                user: "notice",
                message: "A new conversation started"
            });
            break;
        case "conversationEnd":
            userData.output.push({
                user: "notice",
                message: "Conversation ended"
            });
            break;

    }
    dbWrite(userData);
};

// *************************************** Listeners ****

// Listens for changes in the authorization
firebase.auth().onAuthStateChanged((user)=>{
    if(user){
        console.log("You are logged in yey:-)");
        // Write to the database that the raspberry is online
        writeData("online",true);
        // after logged in start listening to data changes of the current user
        database.collection("users").doc(firebase.auth().currentUser.uid)
            .onSnapshot((doc)=>{
                console.log("BIIB BIIB JOTAIN MUUTOKSIA");
                console.log(doc.data());
            });
    }else{
        const rl = readline.createInterface({
            input: process.stdin,
            output:process.stdout
        });
        console.log("You are currently not logged in.");
        rl.question('Do you want to log in? y/n :  ', (request)=>{
            if(request.toLowerCase() === "y" || request.toLowerCase() === "yes"){
                console.log(`Logging in with ${userCred.email}`);
// Let's login the user
                loginWithCreds();
            }else console.log("ok then");
                rl.close();
            });
}});

/*
let userData2 = class {
    online = false;
    sensor = false;
    alarm = "";

    constructor() {

    }
};
*/

// If the connection is made, start the assistant
const startAssistant = ()=>{
    if(safeToStart){
        ledFirst.writeSync(1);
        assistant.start(config.conversation);
    }
};

// Turn led on or off
const ledHandler = (led, ledValue)=>{
    if(ledValue === 1){
        ledValue = 0;
        led.writeSync(ledValue);
    }else{
        ledValue = 1;
        led.writeSync(ledValue);
    }
};

// Turn off the Gpio parts when app closes
const unexportOnClose=()=>{
    ledFirst.writeSync(0);
    ledFirst.unexport();
    ledSecond.writeSync(0);
    ledSecond.unexport();
    ledThird.writeSync(0);
    ledThird.unexport();
    pushButton.unexport();
    sensorSwitch.unexport();
    sensor.unexport();

};

// When Ctrl + C is pressed (Closing terminal application) runs the unexport function
process.on('SIGINT', unexportOnClose);

// ****************************************** GPIO ****

// Listen to changes of the switch
sensorSwitch.watch((err,value)=>{
    if(err) console.log('Switch error', err);
    //console.log(`Switch value is now ${value}`);
    //led.writeSync(value);
    switchValue = value;
    if(switchValue === 1){
        writeData("sensor",true);
    }else{
        writeData("sensor",false);
    }

    ledSecond.writeSync(value);
    ledThird.writeSync(value);
});

// Listen to changes of the button
pushButton.watch((err,value) => {
    if(err) console.error('Button error', err);
    //console.log("button is pressed");
    /*
    if(switchValue === 1){
        console.log("Mic is starting");
        startAssistant();
    }else{
        promptForInput();
    }*/
});

// Listen the changes of the sensor
sensor.watch((err,value)=>{
    if(err) console.log("Sensor error",err);
    // Check if the switch is set on and the sensor is not already in use
    if(switchValue===1 && !inUse){
        inUse = true;
        console.log("Assistance turning on..");
        startAssistant();
    }
});
