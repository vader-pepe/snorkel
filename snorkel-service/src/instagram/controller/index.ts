import { Request, Response } from "express";
import { io } from "@/.";
import { Page } from "puppeteer";
import status from "@/constants/status";
import logger from "@/lib/logger";
import selectors from "@/constants"
import { instagramPageCtx, isInstagramLoggedIn } from "./handling";

const { instagramSelectors } = selectors

export const instagramLoginFlow = async (req: Request, res: Response) => {
  const USERNAME = req.body.username
  const PASSWORD = req.body.password

  if (!!USERNAME && !!PASSWORD) {

    res.status(status.HTTP_200_OK).json({
      status: status.HTTP_200_OK,
      message: 'OK',
    });

    // run immediately after response
    new Promise(async () => {
      if (!!instagramPageCtx) {
        await instagramBeginLogin(instagramPageCtx)
      } else {
        throw ('Instagram Context not Found!')
      }
    })

    async function instagramBeginLogin(page: Page) {
      io.emit('instagram-state-change', 'loading')
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

        const isLoggedin = await isInstagramLoggedIn(instagramPageCtx);
        io.emit('instagram-state-change', 'loading-done')
        if (isLoggedin) {
          io.emit('instagram-state-change', 'logged-in')
        } else {
          io.emit('instagram-state-change', 'need-log-in')
        }
      }
    }

  } else {
    res.status(status.HTTP_400_BAD_REQUEST).json({
      status: status.HTTP_400_BAD_REQUEST,
      message: 'No Username or Password Provided',
    });
  }
};
