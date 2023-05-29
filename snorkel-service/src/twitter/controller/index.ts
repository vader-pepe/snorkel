import { Request, Response } from "express";
import status from "@/constants/status";
import { isTwitterLoggedIn, twitterPageCtx } from "./handling";
import selectors from "@/constants"
import logger from "@/lib/logger";
import { io } from "@/.";

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
        io.emit('twitter-state-change', 'loading')
        await twitterPageCtx.waitForSelector('xpath/' + twitterSelectors.mLoginBtn).then(async () => {
          const isLoginBtnExist = await twitterPageCtx.$x(twitterSelectors.mLoginBtn)
          if (!!isLoginBtnExist && isLoginBtnExist.length > 0) {
            const loginBtn = await isLoginBtnExist[0].$$('xpath/' + '../../..')

            await Promise.all([
              twitterPageCtx.waitForNavigation({
                waitUntil: 'domcontentloaded'
              }),
              loginBtn[0].click()
            ])

            await twitterPageCtx.waitForSelector(twitterSelectors.mUsernameField).then(async () => {
              await twitterPageCtx.type(twitterSelectors.mUsernameField, USERNAME)
            }).catch(() => {
              logger.error('Username field cannot be found or timeout reached!')
            })

            const isNextBtnExist = await twitterPageCtx.$x(twitterSelectors.mNextStep)

            if (!!isNextBtnExist && isNextBtnExist.length > 0) {
              const nextBtn = await isNextBtnExist[0].$$('xpath/' + '../../..')
              nextBtn[0].click()

              await twitterPageCtx.waitForSelector(twitterSelectors.mPasswordField).then(async () => {
                await twitterPageCtx.type(twitterSelectors.mPasswordField, PASSWORD)

                await Promise.all([
                  twitterPageCtx.waitForNavigation({
                    waitUntil: 'domcontentloaded'
                  }),
                  loginBtn[0].click()
                ])
              }).catch(() => {
                logger.error('Password Field not found!')
              })
            } else {
              logger.error('Next Button not found!')
            }

            const isLoggedin = await isTwitterLoggedIn(twitterPageCtx)
            io.emit('twitter-state-change', 'loading-done')
            if (isLoggedin) {
              io.emit('twitter-state-change', 'logged-in')
            } else {
              io.emit('twitter-state-change', 'need-log-in')
            }
          } else {
            logger.error('Login Button not found!')
          }
        }).catch(() => {
          logger.error('Username field cannot be found or timeout reached!')
        })
      } else {
        throw ('Twitter Context cannot be found!')
      }
    })
  } else {
    res.status(status.HTTP_404_NOT_FOUND).json({
      status: status.HTTP_404_NOT_FOUND,
      message: 'Username or Password not provided!',
    });
  }
}
