import { Request, Response } from "express";
import { page as mainPage, io } from "../..";
import { KnownDevices, Page } from "puppeteer";
import status from "../../constants/status";
import logger from "../../lib/logger";
import selectors from "../../constants"

const { instagramSelectors } = selectors

export let instagramPageCtx: Page

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
      // page context for instagram
      const page = await browser.newPage()
      instagramPageCtx = page

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

          }
        }).catch(() => {
          // keep it empty to not throwing any error
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
          logger.info('Already logged in!')
          await page.waitForSelector(instagramSelectors.mNewPost, {
            timeout: 30000
          }).then(async () => {
            await page.waitForSelector('xpath/' + instagramSelectors.notNowSaveLoginInfo).then(async () => {
              await page.click('xpath/' + instagramSelectors.notNowSaveLoginInfo)
            }).catch(() => {
              // keep it empty to not throwing any error
            })

            await page.waitForSelector('xpath/' + instagramSelectors.mCancelAddToHome).then(async () => {
              await page.click('xpath/' + instagramSelectors.mCancelAddToHome)
            }).catch(() => {
              // keep it empty to not throwing any error
            })

            logger.info('Ready for upload!')
            io.emit('instagram-ready')
          })
        }

      } catch (error: any) {
        const errorMsg = error?.message as string
        logger.error(errorMsg)
      }
    })

  } else {
    res.status(status.HTTP_400_BAD_REQUEST).json({
      status: status.HTTP_400_BAD_REQUEST,
      message: 'No Username or Password Provided',
    });
  }
};
