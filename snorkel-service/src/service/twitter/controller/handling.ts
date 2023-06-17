import { KnownDevices, Page } from "puppeteer";
import { Socket } from "socket.io";
import { io, page as mainPage } from "@/.";
import selectors from "@/constants"

const iphoneSe = KnownDevices['iPhone SE']

const { twitterSelectors } = selectors
export let twitterPageCtx: Page
let isTwitterCtxCreated = false

export async function isTwitterLoggedIn(page: Page) {
  let isLoggedin = false

  await page.waitForSelector(twitterSelectors.mNewTweet, { timeout: 1000 }).then(() => {
    isLoggedin = true
  }).catch(() => {
    // keep empty
  })

  return isLoggedin
}

const twitterHandler = async (socket: Socket) => {
  new Promise(async () => {
    io.emit('twitter-state-change', 'loading')
    if (!isTwitterCtxCreated) {
      isTwitterCtxCreated = true
      const browser = mainPage.browser()
      // page context for twitter
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.twitter.com', {
        waitUntil: 'domcontentloaded'
      })

      twitterPageCtx = page

      page.waitForSelector('xpath/' + twitterSelectors.mNotNow).then(() => {
        page.click('xpath/' + twitterSelectors.mNotNow)
      }).catch(() => {
        // keep empty
      })

    }

    if (!!twitterPageCtx) {
      const isLoggedin = await isTwitterLoggedIn(twitterPageCtx)
      io.emit('twitter-state-change', 'loading-done')
      if (isLoggedin) {
        io.emit('twitter-state-change', 'logged-in')
      } else {
        io.emit('twitter-state-change', 'need-log-in')
      }
    }

  })

};

export default twitterHandler
