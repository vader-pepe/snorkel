// const app = require('./app');
// const config = require('./config');
import app from "./app"
import config from "./config"
import { AddressInfo } from 'net'
import http from "http"
import { Server, Socket } from "socket.io"

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  }
})

const PORT = process.env.PORT || config.port;

io.on("connection", (socket: Socket) => {
  console.log("user connected")
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

const server = httpServer.listen(PORT, () => {
  const { port } = server.address() as AddressInfo
  console.log('server is running on port', port);
});

