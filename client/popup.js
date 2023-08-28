//Add event listeners
document.getElementById("createRoomBtn").addEventListener("click", createRoom)
document.getElementById("enterRoomBtn").addEventListener("click", renderEnterRoom)

function createRoom(){
  chrome.tabs.query({active: true}, function(tabs) {
    chrome.tabs.executeScript(null, {file: "execute.js" });
  });
}

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

function enterRoom(){
  let roomCode = document.getElementById("roomIdInput").textContent

  chrome.tabs.query({active: true}, function(tabs) {
    chrome.tabs.executeScript({code: 
    `
    const ws = new WebSocket("ws://localhost:8080");
    
    `});
  });
}