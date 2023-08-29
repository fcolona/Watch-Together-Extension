//Add event listeners
document.getElementById("createRoomBtn").addEventListener("click", createRoom)
document.getElementById("enterRoomBtn").addEventListener("click", renderEnterRoom)

//Injects the script responsible to make a WebSocket request to create a room
function createRoom(){
  chrome.tabs.query({active: true}, function(tabs) {
    chrome.tabs.executeScript(null, {file: "execute.js" });
  });
}

//Renders the html form to enter the desired room id to enter
function renderEnterRoom(){
  const container = document.getElementById("container")
  var child = container.lastElementChild; 
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
  
  const span = document.createElement("span")
  span.textContent = "Room Code: "
  const roomCodeInput = document.createElement("input")
  roomCodeInput.id = "roomIdInput"
  const button = document.createElement("button")
  button.textContent = "Enter"
  button.addEventListener("click", enterRoom)
  
  container.appendChild(span)
  container.appendChild(roomCodeInput)
  container.appendChild(button)
}

//Injects the script responsible to make a WebSocket request to enter a room
function enterRoom(){
  let roomCode = document.getElementById("roomIdInput").value

  chrome.tabs.query({active: true}, function(tabs) {
    chrome.tabs.executeScript({code: 
    `
      const video = document.querySelector("video")
      const ws = new WebSocket("ws://localhost:8080")
      ws.onopen = function(event){
        console.log("WebSocket is connected")
        let data = JSON.stringify({ event: "enterRoom", payload: "${roomCode}" })
        ws.send(data)
        
        
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

      let lastSyncedTime = 0
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
    `});
  });
}