// Initialize Firebase
// TODO: Replace with your project's customized code snippet
// TODO: HIDE THIS ::---))
/*
const firebase = require('firebase');
require("firebase/firestore");*/
const button = document.querySelector("#login");
const psw = document.querySelector('#psw');
const email = document.querySelector('#email');
const isOnline = document.querySelector('#isOnline');
const isSensor = document.querySelector('#isSensor');
const msgBox = document.querySelector('#messageBox');
const loginHolder = document.querySelector("#loginHolder");

firebase.initializeApp(config);

const buildMessages = (messageArray)=>{
    msgBox.innerHTML = "";
    console.log(messageArray);
    const ul = document.createElement("ul");
    for(let msg of messageArray){
        const li = document.createElement("li");
        li.innerText = msg.message;
        li.class = `user${msg.user}`;
        ul.appendChild(li);
    }
    msgBox.appendChild(ul);
};

// Get a reference to the database service
const database = firebase.firestore();

const loginUser = (email,password) =>{
    console.log("kirjaudutaan");
    return firebase.auth().signInWithEmailAndPassword(email,password)
        .then(req =>{
            console.log("kirjautuminen onnistui!");
            return true;
        })
        .catch(err=>{
            console.log(err);
            return(err);
        });
};

const dbWrite = (data) =>{
    if(firebase.auth().currentUser.uid != null){
        database.collection('users').doc(firebase.auth().currentUser.uid).set(data
        ).then((docRef)=>{
            console.log('Document written with id');
            console.log(docRef);
        }).catch(err=>console.log(err));
    }
};
const checkChanges = (newData)=>{
    buildMessages(newData.output);
    isOnline.innerHTML = newData.online;
    isSensor.innerHTML = newData.sensor;
};
// Listens if the authorization is active
firebase.auth().onAuthStateChanged((user)=>{
    if(user){
        console.log("You are logged in yey:-)");
        loginHolder.classList.toggle("hidden");
        // after logged in start listening to data changes of the current user
        database.collection("users").doc(firebase.auth().currentUser.uid)
            .onSnapshot((doc)=>{
                console.log("BIIB BIIB JOTAIN MUUTOKSIA");
                console.log(doc.data());
                checkChanges(doc.data());

            });
    }else{
        // Tänne nappuloiden piilottelua ja muuta
        loginHolder.classList.toggle("hidden");
    }});

// ********************* DOM INTERACTION *********************'

button.addEventListener('click',()=>{
    console.log("dasdasd");
        loginUser(email.value, psw.value).then(req =>{
            console.log(`${email.value} and ${psw.value}`);
            if(req){
                console.log("login successful");

            }else{
                console.log("login unsuccessfull:(");
            }
        });
});