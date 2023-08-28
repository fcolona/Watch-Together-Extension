import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid'

interface Data{
    event: string
}

class Room{
    roomId: string
    sockets: string[] = []
    
    constructor(roomId: string){
      this.roomId = roomId
    }
}

declare class ExtWebSocketServer extends WebSocketServer {
    rooms: Room[]
}

declare interface ExtWebSocket extends WebSocket {
    id: string
}

//@ts-ignore
const server: ExtWebSocketServer = new WebSocket.Server({ port: 8080 });
server.rooms = []

server.on('connection', (ws: ExtWebSocket) => {
  let socketId = uuidv4()
  ws.id = socketId

  ws.on('message', (dataStr) => {
    //@ts-ignore
    const data: Data = JSON.parse(dataStr)

    if (data.event == "createRoom") {
      //Create room
      let roomId = uuidv4()
      const room = new Room(roomId)
      
      //Add socket to room
      room.sockets.push(ws.id)
      
      //Add room to rooms array
      server.rooms.push(room)

      //Log
      console.log(`New client connected: ${ws.id}`)
      console.log(`New room created: ${roomId}`)
      
      //Send room id back to client
      ws.send(`${roomId}`)
    }
    else if(data.event == "pause"){
      console.log("PAUSE")
    }
    else if(data.event == "play"){
      console.log("PLAY")
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})