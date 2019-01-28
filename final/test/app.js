'use strict';

// Set the necessary test functionality
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Using express with node
const express = require('express');
// Using template engine consolidate
const engines = require('consolidate');
// Using test database
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
// Using body parsing middleware. Parses incoming request bodies
const bodyParser = require('body-parser');

// Google Assistant packages
// const GoogleAssistant = require('./googleassistant');
// const deviceCredentials = require('./devicecredentials.json');

// Initialize express
const app = express();

// Setting the Socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Using handlebars as html template
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine', 'hbs');

// Support json encoded bodies
app.use(bodyParser.json());
// Support encoded bodies
app.use(bodyParser.urlencoded({extended: true}));


// Socket connection, connection is made with the user's node application
io.on('connection',(socket)=>{
    console.log('made socket connection');

    socket.on('message',(msg)=>{
        io.emit('message',msg);
    });

    socket.broadcast.emit('hi');

    // When user leaves
    socket.on('disconnect',()=>{
       console.log('user disconnected');
    });
});

//**************************************************************************'

// Front page
app.get('/',(request,response)=>{
    response.set('Cached-Control','public, max-age=300, s-maxage=600');
    response.render('index',{});
});

// Handling login
app.post('/login',(request,response)=>{

    firebase.auth().createUserWithEmailAndPassword(email,password)
        .catch(err => console.log(err)
    );
});
