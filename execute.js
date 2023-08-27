function handleEvent(event){
    if(event.type == "pause"){
        console.log("PAUSED")
    }
    else if(event.type == "play"){
        console.log("PLAYED")
    }
}

document.querySelector("video").addEventListener("play", handleEvent)
document.querySelector("video").addEventListener("pause", handleEvent)