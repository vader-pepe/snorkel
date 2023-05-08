import app from "./app"
import config from "./config"
import { AddressInfo } from 'net'
import http from "http"
import { Server, Socket } from "socket.io"
import { Browser } from "puppeteer"
import puppeteerInstance from "./lib/puppeteerInstance"

const httpServer = http.createServer(app)
let browser: Browser

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  }
})

const PORT = process.env.PORT || config.port;

puppeteerInstance().then(() => {
  const server = httpServer.listen(PORT, () => {
    const { port } = server.address() as AddressInfo
    console.log('server is running on port', port);
  });
})

io.on("connection", (socket: Socket) => {
  console.log("user connected")
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

process.on('SIGINT', async () => {
  if (!!browser) {
    await browser.close();
  }
  process.exit();
});

