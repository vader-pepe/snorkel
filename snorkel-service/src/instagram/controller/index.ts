import { Request, Response } from "express";
import { page as mainPage, io } from "../..";
import { instagramSelectors } from "../../constants";
import { KnownDevices, Page } from "puppeteer";
const iphoneSe = KnownDevices['iPhone SE']

export const instagramFlow = async (req: Request, res: Response) => {
  new Promise(async (_resolve, _reject) => {

    const USERNAME = req.body.username
    const PASSWORD = req.body.password

    if (!!USERNAME && !!PASSWORD) {

      const browser = mainPage.browser()
      const page = await browser.newPage()

      page.setDefaultTimeout(0)

      async function isInstagramLoggedIn(page: Page) {
        let isLoggedin = false

        // to prevent throwing
        await new Promise(async resolve => {
          resolve(await page.waitForXPath(instagramSelectors.loginBtn))
        })

        const isLoginBtnExist = await page.$x(instagramSelectors.loginBtn)
        if (!!isLoginBtnExist && isLoginBtnExist.length > 0) {
          // only the parent is clickable
          const loginBtn = await isLoginBtnExist[0].$$('xpath/' + '..')
          loginBtn[0].click()

          // login process
          await page.waitForSelector(instagramSelectors.emailField)
          await page.type(instagramSelectors.emailField, USERNAME)
          await page.type(instagramSelectors.passwordField, PASSWORD)

          await Promise.all([
            page.waitForNavigation({
              waitUntil: 'domcontentloaded'
            }),
            page.click(instagramSelectors.loginSubmitBtn)
          ])

          io.emit('instagram-security-code')

          io.on('instagram-security-code-input', async (code) => {
            // TODO: start testing this
            await page.waitForSelector(instagramSelectors.securityCode)
            await page.type(instagramSelectors.securityCode, code)
            console.log(code)
          })

          await page.waitForSelector(instagramSelectors.mNewPost, {
            timeout: 30000
          })

        }

        isLoggedin = true

        return isLoggedin
      }

      try {
        await page.emulate(iphoneSe)
        await page.goto('https://www.instagram.com', {
          waitUntil: 'domcontentloaded'
        })

        const isLoggedin = await isInstagramLoggedIn(page)

        if (isLoggedin) {
          // TODO: start uploading
        }

      } catch (error: any) {
        const errorMsg = error?.message as string
        console.log(errorMsg)
      }
    }
  })

  res.status(200).json({ message: 'OK' });
};
