const GoogleAssistant = require('./googleassistant.js');
const deviceCredentials = require('./credentials.json');

const CREDENTIALS = {
    client_id: deviceCredentials.client_id,
    client_secret: deviceCredentials.client_secret,
    refresh_token: deviceCredentials.refresh_token,
    type: "authorized_user"
};

const led = new Gpio(4,'out');

const assistant = new GoogleAssistant(CREDENTIALS);

const date = new Date();

const alarm = new Date();

const setAlarmToday=(time)=>{
    date.setDate(time.getFullYear(),time.getMonth(),time.getDay());
};

const time=()=>{

};