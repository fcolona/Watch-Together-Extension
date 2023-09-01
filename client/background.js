let isConnectionOpen = false
let ws

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "checkConnection"){
        sendResponse(isConnectionOpen)
    }
    if (request.action == "connect") {
        //Setup WebSocket
        ws = new WebSocket("ws://localhost:8080")

        //Open connection
        ws.onopen = (event) => {
            isConnectionOpen = true

            //Listen to messages from the server through WebSocket
            ws.addEventListener("message", (event) => {
                let data = JSON.parse(event.data)
                console.log(data.event)

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
    if (request.action == "pause") {
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
    if (request.action == "play") {
        ws.send(JSON.stringify({ event: request.action, payload: request.payload }))
    }
})
