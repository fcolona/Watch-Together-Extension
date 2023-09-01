const container = document.getElementById("container")
const createRoomBtn = document.getElementById("createRoomBtn")
const enterRoomBtn = document.getElementById("enterRoomBtn")
const startBtn = document.getElementById("startBtn")

chrome.runtime.sendMessage({ action: "checkConnection" }, isConnectionOpen => {
  if (isConnectionOpen) {
    createRoomBtn.style.display = "inline"
    enterRoomBtn.style.display = "inline"

    createRoomBtn.addEventListener("click", createRoom)
    enterRoomBtn.addEventListener("click", renderEnterRoom)
  }
  else {
    startBtn.style.display = "inline"
    startBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "connect" })

      startBtn.style.display = "none"
      createRoomBtn.style.display = "inline"
      enterRoomBtn.style.display = "inline"
      createRoomBtn.addEventListener("click", createRoom)
      enterRoomBtn.addEventListener("click", renderEnterRoom)
    })
  }
})

//Sends a message to the background script to create a room
function createRoom() {
  chrome.runtime.sendMessage({ action: "createRoom" })
}

//Renders the html form to enter the desired room id to enter
function renderEnterRoom() {
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
function enterRoom() {
  let roomId = document.getElementById("roomIdInput").value
  chrome.runtime.sendMessage({ action: "enterRoom", payload: roomId })
}