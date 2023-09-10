let isConnectionOpen = false
let roomId = ""
let ws

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "checkState") {
        sendResponse({ isConnectionOpen, roomId })
    }
    if (request.action == "connect") {
        //Setup WebSocket
        ws = new WebSocket("ws://localhost:8080")

        //Open connection
        ws.onopen = (event) => {
            isConnectionOpen = true

            ws.send(JSON.stringify({ event: "registerName", payload: request.payload }))

            //Listen to messages from the server through WebSocket
            ws.addEventListener("message", (event) => {
                let data = JSON.parse(event.data)
                console.log(data.event)

                if (data.event == "connected") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "connected" });
                    })
                }
                if (data.event == "roomId") {
                    roomId = data.payload
                    chrome.runtime.sendMessage({ action: "roomId", payload: roomId })
                }
                if (data.event == "roomNotFound") {
                    chrome.runtime.sendMessage({ action: "roomNotFound" })
                }
                if (data.event == "socketsInRoom") {
                    chrome.runtime.sendMessage({ action: "socketsInRoom", payload: data.payload })
                }
                if (data.event == "pause") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "pause", payload: data.payload });
                    })
                }
                if (data.event == "play") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "play", payload: data.payload });
                    })
                }
                if (data.event == "syncTime") {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "syncTime", payload: data.payload });
                    })
                }
            })
        }
    }
    if (request.action == "createRoom") {
        ws.send(JSON.stringify({ event: request.action }))
    }
    if (request.action == "enterRoom") {
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
    if (request.action == "updateUrl") {
        console.log(request.payload)
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
    if (request.action == "getSocketsInRoom") {
        ws.send(JSON.stringify({ event: request.action }))
    }
    if (request.action == "pause") {
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
    if (request.action == "play") {
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
    if (request.action == "disconnect") {
        //Set global variables back to default
        isConnectionOpen = false
        roomId = ""

        //Close connection
        ws.close()

        //Send message to update popup
        chrome.runtime.sendMessage({ action: "disconnected" })
    }
})
