import { Request, Response } from "express"
import status from "@/constants/status";
import selectors from "@/constants"
import { facebookPageCtx, isFacebookLoggedIn } from "./handling";
import { Page } from "puppeteer";
import { io } from "@/.";

const { facebookSelectors } = selectors

export const facebookLoginFlow = async (req: Request, res: Response) => {
  const USERNAME = req.body.username
  const PASSWORD = req.body.password

  if (!!USERNAME && !!PASSWORD) {

    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
    });

    async function facebookBeginLogin(page: Page) {
      io.emit('facebook-state-change', 'loading')
      await page.type(facebookSelectors.mEmailField, USERNAME, { delay: 100 })
      await page.type(facebookSelectors.mPassField, PASSWORD, { delay: 100 })
      await page.waitForSelector(facebookSelectors.mLoginBtn),

        await Promise.all([
          page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }),
          page.click(facebookSelectors.mLoginBtn)
        ])

      page.evaluate((selector) => {
        const notNow = document.querySelector(selector) as HTMLButtonElement
        if (!!notNow) {
          notNow.click()
        }
      }, facebookSelectors.mNotNow)

      const isLoggedin = await isFacebookLoggedIn(facebookPageCtx);
      io.emit('facebook-state-change', 'loading-done')
      if (isLoggedin) {
        io.emit('facebook-state-change', 'logged-in')
      } else {
        io.emit('facebook-state-change', 'need-log-in')
      }

    }

    new Promise(async () => {
      if (!!facebookPageCtx) {
        await facebookBeginLogin(facebookPageCtx)
      } else {
        throw ('Facebook Context not Found!')
      }
    })

  } else {
    res.status(status.HTTP_404_NOT_FOUND).json({
      status: status.HTTP_404_NOT_FOUND,
      message: 'Username or Password not provided!',
    });
  }
}

