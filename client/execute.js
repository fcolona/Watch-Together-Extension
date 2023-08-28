//Setup WebSocket
const ws = new WebSocket("ws://localhost:8080");

//Add emit function in order to send custom message types
//WebSocket.prototype.emit = function (eventName, payload) {
  //this.send(JSON.stringify({eventName, payload}));
//}

//Open connection
ws.onopen = function(event){
    console.log("WebSocket is connected")
    ws.send(JSON.stringify({ event: "createRoom" }))
}


//ws.onmessage = (message) => alert(`Your room id is: ${message.data}`)

function handleEvent(event){
    if(event.type == "pause"){
        console.log("PAUSED")
        ws.send(JSON.stringify({ event: "pause" }))
    }
    else if(event.type == "play"){
        console.log("PLAYED")
        ws.send(JSON.stringify({ event: "play" }))
    }
}
document.querySelector("video").addEventListener("play", handleEvent)
document.querySelector("video").addEventListener("pause", handleEvent)
