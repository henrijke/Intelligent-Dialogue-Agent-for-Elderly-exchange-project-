'use strict';
// initialize database
const admin = require('firebase-admin');
// initialize test itself
const functions = require('firebase-functions');
// set test database
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Set timer for the assistant
const setTime = ()=>{};

// Make simple greeting for the user
const greeting = ()=>{

};
exports.nodeAssistant = functions.https.onRequest((request,response)=>{

    // Get the parameters from the user
    const params = request.body.queryResult.parameters;

    // displayName is the title of the intent
    switch(request.body.queryResult.intent.displayName){
        case "setTime":
            break;
        case "greeting":
            break;
        default:
            break;
    }
});