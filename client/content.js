//Searches for a video element and
//Returns the first video it finds or undefined
function getVideoElement() {
    let videoFound = document.getElementsByTagName("video").item(0)

    //Checks if the video was not already found 
    if (typeof window.video === "undefined" || videoFound == null) {
        window.lastSyncedTime = 0.0
    } else {
        window.lastSyncedTime = videoFound.currentTime
    }
    console.log(videoFound)
    
    return videoFound
}

//Handle events related to the user interaction with the video element
//Sends a message to the server
function handleEvent(event) {
    if (event.type == "pause") {
        console.log("PAUSE")
        if (Math.round(window.lastSyncedTime) !== Math.round(window.video.currentTime) && window.video.seeking == false) {
            window.lastSyncedTime = window.video.currentTime
            chrome.runtime.sendMessage({ action: "pause", payload: window.video.currentTime })
        }
    }
    else if (event.type == "play") {
        console.log("PLAY")
        chrome.runtime.sendMessage({ action: "play", payload: window.video.currentTime })
    }
    else if (event.type == "seeking") {
        console.log("SEEKING")
        window.lastSyncedTime = window.video.currentTime
        chrome.runtime.sendMessage({ action: "syncTime", payload: window.video.currentTime })
    }
}


//addListeners comes as true when changing tabs
//And comes as undefined, when not 
if (typeof window.addListeners !== "undefined") {
    if (window.addListeners == true && typeof window.video == "undefined") {
        let video = getVideoElement()
        window.video = video
        if (video !== null) {
            window.video.addEventListener("play", handleEvent)
            window.video.addEventListener("pause", handleEvent)
            window.video.addEventListener("seeking", handleEvent)
            window.video.setAttribute("hasListeners", "true")

            chrome.runtime.sendMessage({ action: "updateUrl", payload: window.parent.location.href })
        }
    }
    //Reset the control variable so that it doesn't give false positives
    //About whether or not the user is changin tabs
    window.addListeners = undefined
}

if (typeof window.checkUrl !== "undefined"){
    if(window.checkUrl == true && typeof window.video !== "undefined"){
        chrome.runtime.sendMessage({ action: "updateUrl", payload: window.parent.location.href })
    }
    window.checkUrl = undefined
}

window.onload = () => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log(`REQUEST: ${request.action}`)
        if (request.action == "connected" && typeof window.video == "undefined") {
            let video = getVideoElement()
            if (video !== null) {
                window.video = video

                window.video.addEventListener("play", handleEvent)
                window.video.addEventListener("pause", handleEvent)
                window.video.addEventListener("seeking", handleEvent)
                window.video.setAttribute("hasListeners", "true")

                chrome.runtime.sendMessage({ action: "updateUrl", payload: window.parent.location.href })
            }
        }
        if (request.action == "pause") {
            window.video.pause()
            window.video.currentTime = request.payload
        }
        if (request.action == "play") {
            window.video.play()
            window.video.currentTime = request.payload
        }
        if (request.action == "syncTime") {
            window.video.currentTime = request.payload
        }
    })

    chrome.runtime.sendMessage({ action: "checkState" }, response => {
        if (response.isConnectionOpen && response.roomId !== "") {
            let video = getVideoElement()
            if (video !== null && typeof window.video == "undefined") {
                window.video = video

                window.video.addEventListener("play", handleEvent)
                window.video.addEventListener("pause", handleEvent)
                window.video.addEventListener("seeking", handleEvent)
                window.video.setAttribute("hasListeners", "true")

                chrome.runtime.sendMessage({ action: "updateUrl", payload: window.parent.location.href })
            }
        }
    })
}