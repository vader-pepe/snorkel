import { Request, Response } from "express"
import status from "../../constants/status";
import selectors from "../../constants/index"
import logger from "../../lib/logger";
import { facebookPageCtx } from "./handling";

const { facebookSelectors } = selectors

export const facebookLoginFlow = async (req: Request, res: Response) => {
  const USERNAME = req.body.username
  const PASSWORD = req.body.password

  if (!!USERNAME && !!PASSWORD) {

    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
    });

    new Promise(async () => {
      if (!!facebookPageCtx) {
        logger.info("User is not logged in. Logging in now")
        await facebookPageCtx.type(facebookSelectors.mEmailField, USERNAME, { delay: 100 })
        await facebookPageCtx.type(facebookSelectors.mPassField, PASSWORD, { delay: 100 })
        await facebookPageCtx.waitForSelector(facebookSelectors.mLoginBtn),

          await Promise.all([
            facebookPageCtx.waitForNavigation({
              waitUntil: 'domcontentloaded'
            }),
            facebookPageCtx.click(facebookSelectors.mLoginBtn)
          ])

        await facebookPageCtx.evaluate((selector) => {
          const notNow = document.querySelector(selector) as HTMLButtonElement
          if (!!notNow) {
            notNow.click()
          }
        }, facebookSelectors.mNotNow)
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

