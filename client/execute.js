const video = document.querySelector("video")

//Setup WebSocket
const ws = new WebSocket("ws://localhost:8080");

//Open connection
ws.onopen = function(event){
    console.log("WebSocket is connected")
    ws.send(JSON.stringify({ event: "createRoom" }))

    ws.addEventListener("message", (event) => {
        let data = JSON.parse(event.data)
        console.log(data.event)
        
        if(data.event == "pause"){
            video.pause()            
            video.currentTime = data.payload
        }
        if(data.event == "play"){
            video.play()
            video.currentTime = data.payload
        }
        if(data.event == "syncTime"){
            video.currentTime = data.payload
        }
    })

}


//ws.onmessage = (message) => alert(`Your room id is: ${message.data}`)

let lastSyncedTime = 0.0
function handleEvent(event){
    if(event.type == "pause"){
        if(Math.round(lastSyncedTime) !== Math.round(video.currentTime) && video.seeking == false){
            lastSyncedTime = video.currentTime
            ws.send(JSON.stringify({ event: "pause", payload: video.currentTime }))
        }
    }
    else if(event.type == "play"){
        ws.send(JSON.stringify({ event: "play", payload: video.currentTime }))
    }
    else if(event.type == "onseeking"){
        if(Math.round(lastSyncedTime) !== Math.round(video.currentTime) && video.paused == true){
            lastSyncedTime = video.currentTime
            ws.send(JSON.stringify({ event: "syncTime", payload: video.currentTime }))
        }
    }
}
video.addEventListener("play", handleEvent)
video.addEventListener("pause", handleEvent)
video.addEventListener("onseeking", handleEvent)