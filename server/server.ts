import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid'
import ShortUniqueId from 'short-unique-id';
import express from 'express'
import * as http from 'http';
import { Request, Response } from 'express';

interface Data {
  event: string
  payload?: string | number
}

class Room {
  id: string
  sockets: string[] = []

  constructor(roomId: string) {
    this.id = roomId
  }
}

interface SocketNameAndUrl {
  name: string
  currentUrl: string
}
interface SocketsNameAndUrlArray extends Array<SocketNameAndUrl> { }

declare class ExtWebSocketServer extends WebSocketServer {
  rooms: Room[]
}

declare interface ExtWebSocket extends WebSocket {
  id: string
  name: string
  roomId: string
  currentUrl: string
}

//Initialize HTTP server
const app = express();
const httpServer = http.createServer(app);

//Initialize Websocket server
//@ts-ignore
const wss: ExtWebSocketServer = new WebSocket.Server({ server: httpServer });
wss.rooms = []

wss.on('connection', (ws: ExtWebSocket) => {
  let socketId = uuidv4()
  ws.id = socketId
  ws.send(JSON.stringify({ event: "connected" }))
  console.log(`New client connected: ${ws.id}`)

  ws.on('message', (dataStr) => {
    //@ts-ignore
    let data: Data = JSON.parse(dataStr)

    if (data.event == "registerName") {
      //@ts-ignore
      ws.name = data.payload
    }
    else if (data.event == "createRoom") {
      //Create room
      let roomId = new ShortUniqueId({ length: 10 })()
      const room = new Room(roomId)

      //Add socket to room
      room.sockets.push(ws.id)
      ws.roomId = roomId

      //Add room to rooms array
      wss.rooms.push(room)

      //Log
      console.log(`New room created: ${roomId}`)

      //Send room id back to client
      let dataToBeSent = JSON.stringify({ event: "roomId", payload: roomId })
      ws.send(dataToBeSent)
    }
    else if (data.event == "enterRoom") {
      let didEnterRoom = false
      wss.rooms.forEach((room) => {
        //Search for the room with given id
        if (room.id == data.payload) {
          //Add socket to room
          room.sockets.push(ws.id)
          //Add roomId to socket
          ws.roomId = room.id

          console.log(`New client connected to the room`)
          didEnterRoom = true

          ws.send(JSON.stringify({ event: "roomId", payload: ws.roomId }))
        }
      })
      if (didEnterRoom == false) {
        ws.send(JSON.stringify({ event: "roomNotFound" }))
      }
    }
    else if (data.event == "updateUrl") {
      //@ts-ignore
      ws.currentUrl = data.payload
    }
    else if (data.event == "getSocketsInRoom") {
      let socketsUrls: SocketsNameAndUrlArray = []
      wss.rooms.forEach((room) => {
        //Search for the room which the socket is in
        if (room.id == ws.roomId) {
          //Iterate through the sockets in the room
          room.sockets.forEach((socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            wss.clients.forEach((socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if (socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket.id !== ws.id) {
                socketsUrls.push({ name: socket.name, currentUrl: socket.currentUrl })
              }
            })
          })
        }
      })
      if (socketsUrls.length !== 0) {
        let dataToBeSent = JSON.stringify({ event: "socketsInRoom", payload: socketsUrls })
        ws.send(dataToBeSent)
      }
    }
    //PAYLOAD HERE IS THE CURRENT VIDEO TIME
    else if (data.event == "pause") {
      wss.rooms.forEach((room) => {
        //Search for the room which the socket is in
        if (room.id == ws.roomId) {
          //Iterate through the sockets in the room
          room.sockets.forEach((socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            wss.clients.forEach((socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if (socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket !== ws) {
                let dataToBeSent: Data = { event: "pause", payload: data.payload }
                socket.send(JSON.stringify(dataToBeSent))
              }
            })
          })
        }
      })
    }
    else if (data.event == "play") {
      wss.rooms.forEach((room) => {
        //Search for the room which the socket is in
        if (room.id == ws.roomId) {
          //Iterate through the sockets in the room
          room.sockets.forEach((socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            wss.clients.forEach((socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if (socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket !== ws) {
                let dataToBeSent: Data = { event: "play", payload: data.payload }
                socket.send(JSON.stringify(dataToBeSent))
              }
            })
          })
        }
      })
    }
    //PAYLOAD HERE IS THE CURRENT VIDEO TIME
    else if (data.event == "syncTime") {
      wss.rooms.forEach((room) => {
        //Search for the room which the socket is in
        if (room.id == ws.roomId) {
          //Iterate through the sockets in the room
          room.sockets.forEach((socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            wss.clients.forEach((socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if (socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket !== ws) {
                let dataToBeSent: Data = { event: "syncTime", payload: data.payload }
                socket.send(JSON.stringify(dataToBeSent))
              }
            })
          })
        }
      })
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')


    let i = 0
    wss.rooms.forEach((room) => {
      //Search for the room which the socket is in
      if (room.id == ws.roomId) {

        let j = 0
        room.sockets.forEach(socketInRoomId => {
          //Remove the socket that is exiting
          if (socketInRoomId == ws.id) {
            room.sockets.splice(j, 1)

            //If the room is empty, remove it
            if (room.sockets.length == 0) {
              wss.rooms.splice(i, 1)
            }
          }
          j++
        })
      }
      i++
    })
  })
})

//Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!")
})

//Start our server
httpServer.listen(8080, () => {
  console.log(`Server started on port 8080`);
});