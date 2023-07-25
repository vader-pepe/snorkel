import { Socket } from "socket.io";
import selectors from "@/constants"
import logger from "@/lib/logger";
import path from "path";
import { KnownDevices, Page } from "puppeteer";
import { page as mainPage } from "@/.";

const iphoneSe = KnownDevices['iPhone SE']
const storage = path.resolve('./src/storage/instagram')
const { instagramSelectors } = selectors

export let instagramPageCtx: Page
let isInstagramCtxCreated = false

export async function isInstagramLoggedIn(page: Page) {
  let isLoggedin = false

  await page.waitForSelector('xpath/' + instagramSelectors.mNewPost, { timeout: 1500 }).then(() => {
    isLoggedin = true
  }).catch(() => {
    // keep empty
  })

  page.waitForSelector('xpath/' + instagramSelectors.mCancelAddToHome).then(() => {
    page.click('xpath/' + instagramSelectors.mCancelAddToHome).catch(() => {
      // keep empty
    })
  }).catch(() => {
    // keep empty
  })

  page.waitForSelector('xpath/' + instagramSelectors.notNowBtn).then(() => {
    page.click('xpath/' + instagramSelectors.notNowBtn).catch(() => {
      // keep empty
    })
  }).catch(() => {
    // keep empty
  })

  page.waitForSelector(instagramSelectors.securityCode).then(() => {
    io.emit('instagram-security-code')
  }).catch(() => {
    // keep empty
  })

  return isLoggedin
}

const instagramHandler = (socket: Socket) => {
  new Promise(async () => {
    if (!isInstagramCtxCreated) {
      isInstagramCtxCreated = true
      const browser = mainPage.browser()
      // page context for instagram
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.instagram.com', {
        waitUntil: 'domcontentloaded'
      })

      instagramPageCtx = page
    }

    if (!!instagramPageCtx) {
      const isLoggedin = await isInstagramLoggedIn(instagramPageCtx);
      if (isLoggedin) {
        io.emit('instagram-state-change', 'logged-in')
      } else {
        io.emit('instagram-state-change', 'need-log-in')
      }
    }
  })

  // security code input handling
  socket.on('instagram-security-code-input', async (code: string) => {
    if (!!instagramPageCtx) {
      await instagramPageCtx.click(instagramSelectors.securityCode, { count: 3 })
      await instagramPageCtx.keyboard.press('Backspace')
      await instagramPageCtx.type(instagramSelectors.securityCode, code)
      await instagramPageCtx.waitForSelector('xpath/' + instagramSelectors.confirmVerifCode).then(async () => {
        await instagramPageCtx.click('xpath/' + instagramSelectors.confirmVerifCode)
      })

      instagramPageCtx.waitForSelector('xpath/' + instagramSelectors.wrongSecurityCode, { timeout: 0 }).then(() => {
        socket.emit('wrong-security-code')
      }).catch(() => {
        // keep empty
      })

      const loggedIn = await isInstagramLoggedIn(instagramPageCtx)
      if (!!loggedIn) {
        socket.emit('instagram-state-change', 'security-code-handled')
        instagramPageCtx.waitForSelector('xpath/' + instagramSelectors.notNowDiv).then(() => {
          instagramPageCtx.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
            // keep empty
          })
        }).catch(() => {
          // keep empty
        })
      }
    }
  })

  socket.on('instagram-start-uploading', async (file: string) => {

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
