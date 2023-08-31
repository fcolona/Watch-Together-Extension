const video = document.querySelector("video")

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "pause") {
        video.pause()
        video.currentTime = request.payload
    }
    if (request.action == "play") {
        video.play()
        video.currentTime = request.payload
    }
    if (request.action == "syncTime") {
        video.currentTime = request.payload
    }
})

let lastSyncedTime = 0.0
function handleEvent(event){
    if(event.type == "pause"){
        if(Math.round(lastSyncedTime) !== Math.round(video.currentTime) && video.seeking == false){
            lastSyncedTime = video.currentTime
            chrome.runtime.sendMessage({ action: "pause", payload: video.currentTime })
        }
    }
    else if(event.type == "play"){
        chrome.runtime.sendMessage({ action: "play", payload: video.currentTime })
    }
    else if(event.type == "onseeking"){
        if(Math.round(lastSyncedTime) !== Math.round(video.currentTime) && video.paused == true){
            lastSyncedTime = video.currentTime
            chrome.runtime.sendMessage({ action: "syncTime", payload: video.currentTime })
        }
    }
}


video.addEventListener("play", handleEvent)
video.addEventListener("pause", handleEvent)
video.addEventListener("onseeking", handleEvent)