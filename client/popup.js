const container = document.getElementById("container")
const createRoomBtn = document.getElementById("createRoomBtn")
const enterRoomBtn = document.getElementById("enterRoomBtn")
const startBtn = document.getElementById("startBtn")

//Listen to messages from the background script
//in order to update the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "roomId") {
    updateState()
  }
  if (request.action == "roomNotFound") {
    updateState("Room not found!")
  }
})

//Updates the popup according to the state of the browser
function updateState(error = "") {
  console.log(`Error: ${error}`)
  chrome.runtime.sendMessage({ action: "checkState" }, response => {
    //If there is an error message, display it
    if (error !== "") {
      const errorSpan = document.createElement("span")
      errorSpan.textContent = error
      container.prepend(errorSpan)
    }
    //If the connection is open and the socket is not connected to a room
    if (response.isConnectionOpen && response.roomId == "") {
      createRoomBtn.style.display = "inline"
      enterRoomBtn.style.display = "inline"

      createRoomBtn.addEventListener("click", createRoom)
      enterRoomBtn.addEventListener("click", renderEnterRoom)
    }
    //If the connection is open and the socket is connected to a room
    else if (response.isConnectionOpen && response.roomId !== "") {
      //Remove all elements inside container
      let child = container.lastElementChild;
      while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
      }
      const roomIdSpan = document.createElement("span")
      roomIdSpan.textContent = `Room Code: ${response.roomId}`
      container.appendChild(roomIdSpan)
    }
    //Default state
    //Neither the connection is open nor the socket is in a room
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
}
updateState()

//Sends a message to the background script to create a room
function createRoom() {
  chrome.runtime.sendMessage({ action: "createRoom" })
}

//Renders the html form to input the desired room id to enter
function renderEnterRoom() {
  var child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }

  const span = document.createElement("span")
  span.id = "roomCodeSpan"
  span.textContent = "Room Code: "
  const roomCodeInput = document.createElement("input")
  roomCodeInput.id = "roomIdInput"
  const button = document.createElement("button")
  button.id = "submitEnterBtn"
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