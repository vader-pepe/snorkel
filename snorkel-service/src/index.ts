import app from "./app"
import config from "./config"
import { AddressInfo } from 'net'
import http from "http"
import { Server } from "socket.io"
import { Page } from "puppeteer"
import puppeteerInstance from "./lib/puppeteer-instance"
import logger from "./lib/logger"
import socketInstance from "./lib/socket-instance"
import initiator from "./initiator"

const { instagramInitiator, facebookInitiator, twitterInitiator } = initiator

const httpServer = http.createServer(app)
export let page: Page

export const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  }
})

const PORT = process.env.PORT || config.port;

puppeteerInstance().then((mainPage) => {
  page = mainPage
  logger.info('Browser initialized')
  // close the extra page
  page.close()
  const server = httpServer.listen(PORT, async () => {
    const { port } = server.address() as AddressInfo
    console.log('server is running on port', port);
  });
}).catch(async (error) => {
  const errorMsg = error.message as string
  logger.error(errorMsg)
})

io.on("connection", (socket) => {
  console.log("user connected")

  new Promise(() => {
    instagramInitiator()
    facebookInitiator()
    twitterInitiator()
  })

  socketInstance(socket)

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})
