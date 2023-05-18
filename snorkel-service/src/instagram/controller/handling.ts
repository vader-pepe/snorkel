import { Socket } from "socket.io";
import selectors from "../../constants/index"
import logger from "../../lib/logger";
import path from "path";
import { writeFile } from "fs";
import { KnownDevices, Page } from "puppeteer";
import { io, page as mainPage } from "../..";

const iphoneSe = KnownDevices['iPhone SE']

const storage = path.resolve('./src/storage/instagram')

export let instagramPageCtx: Page

type ServerResponse = (arg: { message: string }) => { message: string }

const { instagramSelectors } = selectors

export const instagramInitiator = async () => {
  if (!!io && !!mainPage) {
    // run immediately after server start
    new Promise(async () => {
      const browser = mainPage.browser()
      // page context for instagram
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.instagram.com', {
        waitUntil: 'domcontentloaded'
      })

      instagramPageCtx = page
      io.emit('instagram-loading')
      const isLoggedin = await isInstagramLoggedIn(instagramPageCtx);
      if (isLoggedin) {
        io.emit('instagram-logged-in')
      } else {
        io.emit('instagram-need-log-in')
      }
      io.emit('instagram-loading-done')
    }).catch(err => {
      const errorMsg = err?.message
      logger.error(errorMsg)
    })

  } else {
    throw ('socket.io or browser instance not found!')
  }

  async function isInstagramLoggedIn(page: Page) {
    let isLoggedin = false

    await page.waitForXPath(instagramSelectors.loginBtn).then(() => {
      return true
    }).catch(() => {
      // keep it empty to not throwing any error
    })

    return isLoggedin
  }
}

const instagramHandler = (socket: Socket) => {
  // security code input handling
  socket.on('instagram-security-code-input', async (code: string) => {
    if (!!instagramPageCtx) {
      await instagramPageCtx.type(instagramSelectors.securityCode, code)
      await instagramPageCtx.waitForXPath(instagramSelectors.confirmVerifCode).then(async () => {
        await instagramPageCtx.click('xpath/' + instagramSelectors.confirmVerifCode)
      })
    }
  })

  socket.on('instagram-start-uploading', async (file: string | NodeJS.ArrayBufferView, callback: ServerResponse) => {

    writeFile(storage, file, (err) => {
      // TODO: finish this man
      callback({ message: err ? "failure" : "success" });
    });

    if (!!instagramPageCtx) {
      await instagramPageCtx.waitForSelector(instagramSelectors.mNewPost).then(async () => {

        await instagramPageCtx.evaluate((selector) => {
          const allHome = Array.from(document.querySelectorAll(selector)) as SVGElement[];
          // this is the best I can come with
          allHome[1]?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

        }, instagramSelectors.mNewPost)

        const [fileChooser] = await Promise.all([
          instagramPageCtx.waitForFileChooser(),
          instagramPageCtx.evaluate((selector) => {
            function getElementByXpath(path: string) {
              return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            }

            const post = getElementByXpath(selector)
            // this is the best I can come with
            post?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

          }, instagramSelectors.mPostSpan)
        ])

        await fileChooser.accept([`${storage}/${file}`]);

      }).catch(() => {
        logger.error('For some reason upload button is not available')
      })
    }
  })
}

export default instagramHandler
