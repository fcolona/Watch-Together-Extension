import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid'

interface Data{
    event: string
    payload?: string | number
}

class Room{
    id: string
    sockets: string[] = []
    
    constructor(roomId: string){
      this.id = roomId
    }
}

declare class ExtWebSocketServer extends WebSocketServer {
    rooms: Room[]
}

declare interface ExtWebSocket extends WebSocket {
    id: string
    roomId: string
}

//@ts-ignore
const server: ExtWebSocketServer = new WebSocket.Server({ port: 8080 });
server.rooms = []

server.on('connection', (ws: ExtWebSocket) => {
  let socketId = uuidv4()
  ws.id = socketId

  ws.on('message', (dataStr) => {
    //@ts-ignore
    let data: Data = JSON.parse(dataStr)

    if (data.event == "createRoom") {
      //Create room
      let roomId = uuidv4()
      const room = new Room(roomId)
      
      //Add socket to room
      room.sockets.push(ws.id)
      ws.roomId = roomId
      
      //Add room to rooms array
      server.rooms.push(room)

      //Log
      console.log(`New client connected: ${ws.id}`)
      console.log(`New room created: ${roomId}`)
      
      //Send room id back to client
      let dataToBeSent = JSON.stringify({event: "roomId", payload: roomId})
      ws.send(dataToBeSent)
    }
    else if(data.event == "enterRoom"){
      server.rooms.forEach( (room) => {
        //Search for the room with given id
        if(room.id == data.payload){
          //Add socket to room
          room.sockets.push(ws.id)
          //Add roomId to socket
          ws.roomId = room.id
          console.log(`New client connected: ${ws.id}`)
        }
      })
    }
    //PAYLOAD HERE IS THE CURRENT VIDEO TIME
    else if(data.event == "pause"){
      server.rooms.forEach( (room) => {
        //Search for the room which the socket is in
        if(room.id == ws.roomId){
          //Iterate through the sockets in the room
          room.sockets.forEach( (socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            server.clients.forEach( (socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if(socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket !== ws){
                let dataToBeSent: Data = {event: "pause", payload: data.payload}
                socket.send(JSON.stringify(dataToBeSent))
              }
            })
          })
        }
      })
    }
    else if(data.event == "play"){
      server.rooms.forEach( (room) => {
        //Search for the room which the socket is in
        if(room.id == ws.roomId){
          //Iterate through the sockets in the room
          room.sockets.forEach( (socketInRoomId) => {
            //Iterate through all sockets
            //@ts-ignore
            server.clients.forEach( (socket: ExtWebSocket) => {
              //Check if the socket is in the room, is open and is not the sender itself
              if(socket.id == socketInRoomId && socket.readyState === WebSocket.OPEN && socket !== ws){
                let dataToBeSent: Data = {event: "play" }
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
  })
})