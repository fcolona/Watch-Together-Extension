import { WebSocketServer } from "ws";

interface ExtWebSocket extends WebSocket {
  on(arg0: string, arg1: (message: string) => void): unknown;
  id: string
}