//Setup WebSocket
const wss = new WebSocket("ws://localhost:8080");
wss.onopen = (event) => console.log("WebSocket is connected")

function handleEvent(event){
    if(event.type == "pause"){
        console.log("PAUSED")
        wss.send("PAUSED")
    }
    else if(event.type == "play"){
        console.log("PLAYED")
        wss.send("PLAYED")
    }
}
document.querySelector("video").addEventListener("play", handleEvent)
document.querySelector("video").addEventListener("pause", handleEvent)
