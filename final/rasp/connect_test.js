const io = require('socket.io-client');
console.log('1');
const socket = io.connect('https://nodeassistant-9f5ff.firebaseapp.com',{reconnect: true});
console.log('2');
socket.on('connect',(socket)=>{
    console.log('Connected');
});
console.log('3');