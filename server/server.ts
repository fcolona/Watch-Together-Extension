import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid'
import { ExtWebSocket } from './typings';

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws: ExtWebSocket) => {
  ws.id = uuidv4()
  console.log(`New client connected: ${ws.id}`);

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);
    ws.send(`Server received your message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});