'use strict';
// Setup *************************************************************
// Set the necessary test functionality
const functions = require('firebase-functions');
const firebase = require('firebase-admin');
// Using express with node
const express = require('express');
// Initialize express
const app = express();
// Setting up the socket connection
/*
const http = require('http').Server(app);
const io = require('socket.io')(http);
*/
// Using body parsing middleware. Parses incoming request bodies
const bodyParser = require('body-parser');
// Support json encoded bodies
app.use(bodyParser.json());
// Support encoded bodies
app.use(bodyParser.urlencoded({extended: true}));
// Using template engine consolidate
const engines = require('consolidate');
// Create engine
app.engine('hbs', engines.handlebars);
// Set views folder
app.set('views','./views');
// Use engine
app.set('view engine','hbs');
// Using test database
firebase.initializeApp(
    // Using test functions helper to initialize
    functions.config().firebase
);

const db = firebase.firestore();

// Firestore functions **********************************************************
const getData = () => {
    return new Promise((resolve, reject) => {
        db.collection('data').get()
            .then((snapshot) => {
                let output = [];
                snapshot.forEach((doc) => {
                    output.push({name: doc.data().value});
                });
                console.log(output);
                resolve(output);
                return true;
            }).catch((err) => {
            reject(err);
        });
    });
};

const getAllTimes = ()=>{
    return new Promise((resolve,reject)=>{
        db.collection('time').get()
            .then((snapshot) => {
                let outputMessage = [];
                snapshot.forEach((doc) => {
                    outputMessage.push(doc.data());
                });
                resolve(outputMessage);
                return true;
            })
            .catch((err) => {
                reject(err);
            });
    });
};
const timeSearch = (params) =>{
    return new Promise( (resolve,reject)=> {
        db.collection('time').get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.data().added === params.added) {
                        resolve(doc);
                        return doc;
                        //Huom forEachista ei pääse siististi pois kesken kaiken
                    }
                });
                resolve (false);
                return false;
            })
            .catch((err) => {
                console.log('Error getting documents', err);
                reject(err);
            });
    })};

const remove = (params)=>{
    return new Promise((resolve,reject)=>{
            db.collection('time').doc(params.id).delete().then(() =>{
            return true;
        }).catch((err)=>
            reject(err));

    });
};

const removeTime = (params)=>{
    return new Promise ((resolve,reject)=>{
        timeSearch(params).then(result => {
            if (result) {
                resolve(remove(result));
                return remove(result);
            } else {
                resolve(`${params.added} wasn't found!`);
                return false;
            }
        }).catch((err)=>{
            reject(err);
        })
    });
};

const addTime=(time) => {
    return new Promise((resolve,reject)=>{
        db.collection('time').add({
            time: time,
            added: Date.now()
        }).then((ref) =>{
            resolve(`New document added with ID: ${ref.id}`);
            return true;
        }).catch((err)=>{
            console.log('Error adding new name', err);
            reject(err);
        });
    });
};

// Functions *****************************************************************

// Send data back to the assistant
const responseSender = (message,response)=>{
    response.send({
        fulfillmentText: message
    });
};

const handleDay = (output,compare)=>{
    if(output.getDate() < compare){
        output.setDate(compare);
    }
    return output;
};

const timeBuilder =(currentDay, dateInput) => {
    let output = new Date(String(dateInput));
    output = handleDay(output,currentDay);
    return output;
};

const handleTime = (timeObject)=>{
    console.log('handleTime');
    let output = new Date();
    // the different times are set in order from most vague to most specific
    if(timeObject.date !== ""){
        console.log("Date " + timeObject.date);
        output = timeBuilder(output.getDate(),timeObject.date);
    }
    if(timeObject['time-period'] !== ""){
        console.log("time-period " + timeObject['time-period'].startTime);
        output = timeBuilder(output.getDate(),timeObject['time-period'].startTime);
    }
    if(timeObject.time !== ""){
        console.log("time " + timeObject.time);
        output = timeBuilder(output.getDate(),timeObject.time);
        console.log(output.getTimezoneOffset());
    }
    console.log(output);
    return output;
};

const password = "salasana";
const checkUser = (userId)=>{
    return userId === password;
};

// **********************************************************************
// Index page
app.get('/',(req,res)=>{
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getData().then(response =>{
        console.log(response);
        res.render('index', {response});
    });
});

app.post('/test',(req,res)=>{
    const returnObject = {
        led: 0,
        message: "",
        error: false
    };
    console.log(req.body.userId);
    if(checkUser(req.body.userId)){
        returnObject.led = 1;
        returnObject.message = "Hyvin näyttää toimivan";
    }else{
        returnObject.error = true;
        returnObject.message = "User Id is incorrect"
    }
    res.send(returnObject);
});

//Dialogflow webhook functions happen here
app.post('/webhook',(req,res)=>{
    const parameters = req.body.queryResult.parameters;
    switch(req.body.queryResult.intent.displayName){
        case "setAlarm":
            //TODO Set alarm
            console.log(parameters);
            const output = handleTime(parameters);
            addTime(output).then((result)=> {
                return responseSender(output, res);
            }).catch(err=>console.log(err));
            break;
        case "getAllAlarms":
            getAllTimes().then((result)=>{
                let stringMessage = "";
                for(let item of result){
                    stringMessage += ` ${item.time}`;
                }
                return responseSender(stringMessage,res);
            }).catch(err=>console.log(err));
            break;
        case "setGreeting":
            //TODO Set greeting
            responseSender();
            break;
        case "makeGreeting":
            //TODO Say greeting
            responseSender();
            break;
        default:
            break;
    }
});

//Mahdollinen login sivustolle
app.get('/login',(req,res)=>{

});

// Socket.io **********************************************************************
//SOCKET EI  TAIDA TOIMII FIREBASES:D:D::D:D:D FUCK
// https://codelabs.developers.google.com/codelabs/firebase-web/#2
/*
io.on('connection',(socket) => {
    console.log("made socket connection");

    socket.on('message',(msg)=>{
        io.emit('message',msg);
    });

    socket.broadcast.emit('hi');

    // When user leaves
    socket.on('disconnect',()=>{
        console.log('user disconnected');
    });
});
*/

// Exports **************************************************************
exports.app = functions.https.onRequest(app);
/*
exports.assistant = functions.https.onRequest((request, response)=>{

});
*/