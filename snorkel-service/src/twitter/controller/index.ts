import { Request, Response } from "express";
import status from "../../constants/status";
import { twitterPageCtx } from "./handling";
import selectors from "../../constants/index"
import logger from "../../lib/logger";

const { twitterSelectors } = selectors

export const twitterLoginFlow = async (req: Request, res: Response) => {
  const USERNAME = req.body.username
  const PASSWORD = req.body.password

  if (!!USERNAME && !!PASSWORD) {
    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
    });

    new Promise(async () => {
      if (!!twitterPageCtx) {
        await twitterPageCtx.waitForXPath(twitterSelectors.mLoginBtn).then(async () => {
          const isLoginBtnExist = await twitterPageCtx.$x(twitterSelectors.mLoginBtn)
          if (!!isLoginBtnExist && isLoginBtnExist.length > 0) {
            const loginBtn = await isLoginBtnExist[0].$$('xpath/' + '../../..')
            loginBtn[0].click()
          }
        }).catch(() => {
          logger.error('Username field cannot be found or timeout reached!')
        })
      }
    })
  } else {
    res.status(status.HTTP_404_NOT_FOUND).json({
      status: status.HTTP_404_NOT_FOUND,
      message: 'Username or Password not provided!',
    });
  }
}
