const GoogleAssistant = require('./googleassistant.js');
const deviceCredentials = require('./credentials.json');

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};

const assistant = new GoogleAssistant(CREDENTIALS);

assistant.startConversation(["RaspAssistant"])
    .then(({text})=>{
        console.log(text);
        return assistant.endConversation();
    })
    .catch(err=> console.log(err));