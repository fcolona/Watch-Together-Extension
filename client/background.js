let isConnectionOpen = false
let roomId = ""
let ws


function keepAlive() {
    const keepAliveIntervalId = setInterval(
        () => {
            if (isConnectionOpen) {
                ws.send(JSON.stringify({ event: "keepalive" }));
            } else {
                clearInterval(keepAliveIntervalId);
            }
        },
        // Set the interval to 20 seconds to prevent the service worker from becoming inactiv
        20 * 1000
    );
}

chrome.runtime.onInstalled.addListener((object) => {
    let internalUrl = chrome.runtime.getURL("views/help.html")

    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: internalUrl });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "checkState") {
        sendResponse({ isConnectionOpen, roomId })
    }
    if (request.action == "connect") {
        //Setup WebSocket
        ws = new WebSocket("ws://watchtogether.tech")

        //Open connection
        ws.onopen = (event) => {
            isConnectionOpen = true

            ws.send(JSON.stringify({ event: "registerName", payload: request.payload }))

            keepAlive()

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

    //Terminate WebSocket connection on browser closing
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        chrome.tabs.query({}, (tabs) => {
            //Check if the tab closed was the last one
            if (tabs.length === 0) {
                //Set global variables back to default
                isConnectionOpen = false
                roomId = ""

                //Close connection
                ws.close()

                //Send message to update popup
                chrome.runtime.sendMessage({ action: "disconnected" })
            }
        })
    })
})



chrome.tabs.onActivated.addListener((activeInfo) => {
    //If the connection is open and it is in a room
    //Run content script in order to add event listeners and update video url
    if (isConnectionOpen && roomId !== "") {
        chrome.scripting.executeScript({
            target: { tabId: activeInfo.tabId },
            args: [{ addListeners: true }],
            func: vars => Object.assign(self, vars),
        }, () => {
            chrome.scripting.executeScript({ target: { tabId: activeInfo.tabId }, files: ['content.js'] });
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId) => {
    if (isConnectionOpen && roomId !== "") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            args: [{ checkUrl: true }],
            func: vars => Object.assign(self, vars),
        }, () => {
            chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] });
        });
    }
});