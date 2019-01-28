// TODO määrittele osoite koska nyt defaultti on väärä:--)
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socket = io();

const button = document.querySelector('#button');
const message = document.querySelector('#message');
const form = document.querySelector('#form');
const container = document.querySelector('#container');
//form.preventDefault();

button.addEventListener('click',()=>{
    console.log(message.value);
    message.value = "";
    return false;
});

socket.emit('chat message',message.value);

// Listens to the socket
socket.on('message',(msg)=>{
    const newMessage= document.createElement('p');
    newMessage.innerText = msg;
    container.appendChild(newMessage);
});