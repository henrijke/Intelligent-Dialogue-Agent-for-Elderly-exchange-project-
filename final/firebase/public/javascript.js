const login = document.querySelector('#login');
const logout = document.querySelector('#logout');

const message = document.querySelector('#message');
const form = document.querySelector('#form');
const container = document.querySelector('#container');
//form.preventDefault();

button.addEventListener('click',()=>{
    console.log(message.value);
    socket.emit('chat message',message.value);
    message.value = "";
    return false;
});

login.addEventListener('click',()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
});

logout.addEventListener('click',()=>{
    firebase.auth().signOut();
});

// Initiate test auth.
function initFirebaseAuth() {
    // TODO 3: Initialize Firebase.
    firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
    // TODO 4: Return the user's profile pic URL.
    return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
    // TODO 5: Return the user's display name.
    return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
    // TODO 6: Return true if a user is signed-in.
    return !!firebase.auth().currentUser;
}