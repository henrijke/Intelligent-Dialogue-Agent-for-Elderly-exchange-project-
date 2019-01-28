const GoogleAssistant = require('./googleassistant.js');
const deviceCredentials = require('./credentials.json');

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};

const assistant = new GoogleAssistant(CREDENTIALS);

assistant.assist('Hello!')
    .then(({text}) =>{
        console.log(text);
        return assistant.assist("What's the weather like");
    })
    .then(({text})=>{
        console.log(text);
        setTimeout(resetCooldown,30000);
    })
    .catch(err => console.log(err));