const button = document.querySelector('#button');
const returnMessage = document.querySelector('#response');
const message = document.querySelector("#message");
const checkbox = document.querySelector('#checkbox');
const header = document.querySelector('#header');
const testButton = document.querySelector('#butts');

const writeResponse =(message)=>{
    returnMessage.innerHTML = message;
};

const checkBackend=()=>{
    fetch('/check').then(data=>data.json())
        .then((resp)=>{
            console.log("checked backend");
            console.log(resp);
            if(resp===true){
                header.innerHTML = "BACKEND NAPPIA PAINETTU!";
                header.id="alert";
            }
        }).catch(err=>console.log(err))
};

testButton.addEventListener('click',()=> {
    fetch('/assistant').then(data => data.json())
        .then((resp) => {
            console.log(resp);
        });
});

button.addEventListener('click',()=>{
    fetch('/message', {
        method: 'POST',
        //bodyn lähettäminen ei toimi ilman että header määritellään lol
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message.value,
            checkbox: checkbox.checked
        })
    })
        .then(data => data.json())
        .then((resp) =>{
            console.log(resp);
            writeResponse(resp.value);
        }).catch(err=>console.log(err))
});

//setInterval(checkBackend,1000);
