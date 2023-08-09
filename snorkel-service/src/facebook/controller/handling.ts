import { Socket } from "socket.io";
import { io, page as mainPage } from "@/.";
import { KnownDevices, Page } from "puppeteer";
import logger from "@/lib/logger";
import selectors from "@/constants"

const iphoneSe = KnownDevices['iPhone SE']

const { facebookSelectors } = selectors
export let facebookPageCtx: Page
let isFacebookCtxCreated = false

export async function isFacebookLoggedIn(page: Page) {
  let alreadyLoggedIn = false

  await page.waitForSelector('xpath/' + facebookSelectors.mStatusFieldXpath, { timeout: 1500 }).then(async () => {
    alreadyLoggedIn = true
  }).catch(() => {
    // keep empty
  })

  return alreadyLoggedIn
}

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

const facebookHandler = (socket: Socket) => {

  new Promise(async () => {
    io.emit('facebook-state-change', 'loading')
    if (!isFacebookCtxCreated) {
      isFacebookCtxCreated = true
      const browser = mainPage.browser()
      // page context for facebook
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto('https://www.facebook.com', {
        waitUntil: 'domcontentloaded'
      })

      facebookPageCtx = page
    }

    if (!!facebookPageCtx) {
      const isLoggedin = await isFacebookLoggedIn(facebookPageCtx);
      io.emit('facebook-state-change', 'loading-done')
      if (isLoggedin) {
        io.emit('facebook-state-change', 'logged-in')
      } else {
        io.emit('facebook-state-change', 'need-log-in')
      }
    }
  })

  socket.on('facebook-new-text-status', (status: string) => {
    facebookNewTextStatus(facebookPageCtx, status)
  })
};

export default facebookHandler
