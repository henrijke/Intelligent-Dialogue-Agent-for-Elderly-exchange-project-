const GoogleAssistant = require('./googleassistant.js');
const deviceCredentials = require('./credentials.json');

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};

const assistant = new GoogleAssistant(CREDENTIALS);

assistant.assist('what is the weather')
    .then(({text}) =>{
        console.log(text);
        return assistant.assist("what about tomorrow");
    })
    .then(({text})=>{
        console.log(text);
    })
    .catch(err => console.log(err));