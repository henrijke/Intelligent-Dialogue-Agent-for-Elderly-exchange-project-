'use strict';
// Setup *************************************************************
// Set the necessary test functionality
const functions = require('firebase-functions');
const firebase = require('firebase-admin');
// Using express with node
const express = require('express');
// Initialize express
const app = express();
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
const expressValidator = require('express-validator');
const expressSession = require('express-session');
app.use(expressValidator());
// saveunitiliazed määrittää tallennetaanko vaikka ei oli initilisoitu, resave tallentaa joka kutsun vaikka ei olisi initialisoitu
app.use(expressSession({secret: 'MerenneitoPanini', saveUninitialized: false, resave: false}));
firebase.initializeApp(
    // Using test functions helper to initialize
    functions.config().firebase
);

const db = firebase.firestore();

// Firestore functions **********************************************************
const getData = (data) => {
    return new Promise((resolve, reject) => {
        db.collection(data).get()
            .then((snapshot) => {
                let output = [];
                snapshot.forEach((doc) => {
                    // output.push({name: doc.data().value});
                    output.push(doc.data());
                });
                resolve(output);
                return true;
            }).catch((err) => {
            reject(err);
        });
    });
};
const getAllTimes = ()=>{
        return getData('time');
};
const timeSearch = (params) =>{
        return getAllTimes().then(data =>{
                data.forEach((doc)=>{
                    if (doc.data().added === params.added) {
                        resolve(doc);
                        return doc;
                    }
                });
            resolve (false);
            return false;
            }).catch(err=>console.log(err))
};

const removeData = (params, data)=>{
    return new Promise((resolve,reject)=>{
            db.collection(data).doc(params.id).delete().then(() =>{
                resolve(true);
                return true;
        }).catch((err)=>
            reject(err));
    });
};

const getGreetings = ()=>{
    return getData('greeting');
};

const sayGreeting = (greetingId) => {
    return new Promise((resolve,reject) => {
        getGreetings()
            .then(result => {
                for (let res of result){
                    if(res.id === greetingId){
                        resolve(res);
                        return res;
                    }
                }
            })
            .catch(err => console.log(err));
    });
};

const removeTime = (params)=>{
    return new Promise ((resolve,reject)=>{
        timeSearch(params).then(result => {
            if (result) {
                resolve(removeData(result, 'time'));
                return removeData(result, 'time');
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
    /*
    getData('data').then(response =>{
        console.log(response);
        res.render('index3', {
            response:response,
            login: true
        });
    });*/
    res.render('login',{});
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
        case "sayGreeting":
            //TODO Say greeting
            sayGreeting(1).then(data =>{
                    responseSender(data);
                }
            );
            break;
        default:
            break;
    }
});

//Mahdollinen login sivustolle
app.get('/login',(req,res)=>{

});

// Exports **************************************************************
exports.app = functions.https.onRequest(app);
/*
exports.assistant = functions.https.onRequest((request, response)=>{

});
*/