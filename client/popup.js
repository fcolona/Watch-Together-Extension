//Add event listeners
document.getElementById("createRoomBtn").addEventListener("click", createRoom)
document.getElementById("enterRoomBtn").addEventListener("click", renderEnterRoom)

//Sends a message to the background script to create a room
function createRoom(){
  chrome.runtime.sendMessage({ action: "createRoom" })
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

//Sends a message to the background script to enter a room with a given id
function enterRoom(){
  let roomId = document.getElementById("roomIdInput").value
  chrome.runtime.sendMessage({ action: "enterRoom", payload: roomId })
}