import { Socket } from "socket.io";
import { io, page as mainPage } from "../..";
import { KnownDevices, Page } from "puppeteer";
import logger from "../../lib/logger";
import selectors from "../../constants/index"

const { facebookSelectors } = selectors

export let facebookPageCtx: Page

const iphoneSe = KnownDevices['iPhone SE']

export const facebookInitiator = async () => {

  if (!!io && !!mainPage) {
    new Promise(async () => {
      const browser = mainPage.browser()
      // page context for facebook
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.facebook.com', {
        waitUntil: 'domcontentloaded'
      })

      facebookPageCtx = page
      io.emit('facebook-loading')
      const isLoggedin = await isFacebookLoggedIn(page);
      if (isLoggedin) {
        io.emit('facebook-logged-in')
      } else {
        io.emit('facebook-need-log-in')
      }
      io.emit('facebook-loading-done')
    }).catch(err => {
      const errorMsg = err?.message
      logger.error(errorMsg)
    })
  } else {
    throw ('socket.io or browser instance not found')
  }

  async function isFacebookLoggedIn(page: Page) {
    let alreadyLoggedIn = false

    await page.waitForSelector(facebookSelectors.mEmailField).then(async () => {
      alreadyLoggedIn = await page.evaluate((selector) => {
        const emailField = document.querySelector(selector)
        if (!!emailField) {
          return false
        }
        return true
      }, facebookSelectors.mEmailField)
    }).catch(() => {
      // keep empty
    })

    return alreadyLoggedIn
  }
}

const facebookHandler = (socket: Socket) => {

  socket.on('facebook-new-text-status', facebookNewTextStatus)

  async function facebookNewTextStatus(page: Page, newStatus: string) {

    await page.waitForSelector(facebookSelectors.mNewPost)

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      page.click(facebookSelectors.mNewPost)
    ])

    await page.type(facebookSelectors.mStatusField, newStatus, { delay: 100 })
    // weird Facebook behaviour
    await page.evaluate((selector) => {
      let btn = document.querySelector(selector) as HTMLButtonElement
      btn.click()
    }, facebookSelectors.mPostBtn)

    // dialog leaving Facebook will appear for no reason
    page.on('dialog', async dialog => {
      console.log(dialog.type());
      console.log(dialog.message());
      await dialog.dismiss();
    });

    logger.info("Successfully post a status")
  }

};

export default facebookHandler
