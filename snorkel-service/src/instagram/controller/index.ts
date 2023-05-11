import { Request, Response } from "express";
import { page as mainPage, io } from "../..";
import { instagramSelectors } from "../../constants";
import { KnownDevices, Page } from "puppeteer";
import status from "../../constants/status";
import logger from "../../lib/logger";
const iphoneSe = KnownDevices['iPhone SE']

export const instagramFlow = async (req: Request, res: Response) => {
  const USERNAME = req.body.username
  const PASSWORD = req.body.password

  if (!!USERNAME && !!PASSWORD) {

    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
    });

    new Promise(async () => {
      const browser = mainPage.browser()
      const page = await browser.newPage()

      async function isInstagramLoggedIn(page: Page) {
        let isLoggedin = false

        await page.waitForXPath(instagramSelectors.loginBtn).then(async () => {
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

            await page.waitForSelector(instagramSelectors.securityCode).then(() => {

              io.emit('instagram-security-code')

            }).catch(() => {
              logger.info('No security code needed')
            })

            // TODO: this doesn't triggered. propbably because there is no way
            // back to this route.
            io.on('instagram-security-code-input', async (code) => {
              await page.type(instagramSelectors.securityCode, code)
            })

            await page.waitForSelector(instagramSelectors.mNewPost, {
              timeout: 30000
            })

          }
        }).catch(() => {
          logger.info('Already Logged in')
        })

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
        logger.error(errorMsg)
      }
    })

  } else {
    res.status(status.HTTP_400_BAD_REQUEST).json({
      status: status.HTTP_400_BAD_REQUEST,
      message: 'No Username Provided',
    });
  }
};
