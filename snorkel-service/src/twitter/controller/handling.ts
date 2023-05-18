import { KnownDevices, Page } from "puppeteer";
import { Socket } from "socket.io";
import { io, page as mainPage } from "../..";
import selectors from "../../constants/index"

const { twitterSelectors } = selectors

export let twitterPageCtx: Page

const iphoneSe = KnownDevices['iPhone SE']

export const twitterInitiator = async () => {
  if (!!io && !!mainPage) {
    new Promise(async () => {
      const browser = mainPage.browser()
      // page context for twitter
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.twitter.com', {
        waitUntil: 'domcontentloaded'
      })

      twitterPageCtx = page

      io.emit('twitter-loading')
      const isLoggedin = await isTwitterLoggedIn(page)
      if (isLoggedin) {
        io.emit('twitter-logged-in')
      } else {
        io.emit('twitter-need-log-in')
      }
      io.emit('twitter-loading-done')

      await page.waitForXPath(twitterSelectors.mNotNow).then(async () => {
        await page.click('xpath/' + twitterSelectors.mNotNow)
      }).catch(() => {
        // keep empty
      })

    })
  } else {
    throw ('socket.io or browesr instance not found!')
  }

  async function isTwitterLoggedIn(page: Page) {
    let isLoggedin = false

    await page.waitForSelector(twitterSelectors.mNewTweet).then(() => {
      isLoggedin = true
    }).catch(() => {
      // keep empty
    })

    return isLoggedin
  }

}

const twitterHandler = async (socket: Socket) => {

};

export default twitterHandler
