import selectors from "@/constants";
import { Page } from "puppeteer";
import { EventEmitter } from 'events'
import TypedEventEmitter from "typed-emitter";
import { State } from "@/constants/Events";

const { instagramSelectors } = selectors
const STATE_CONSTANT = 'instagram-state-change'

const instagramState = {
  ...State,
  INSTAGRAM_NEED_SECURITY_CODE: 'instagram-need-security-code',
  WRONG_SECURITY_CODE: 'wrong-security-code',
  SECURITY_CODE_DONE: 'security-code-handled'
} as const

type StateKeys = keyof typeof instagramState;
type StateValues = typeof instagramState[StateKeys];

export type InstagramEvents = {
  [STATE_CONSTANT]: (arg: StateValues) => void
}

export class InstagramController extends (EventEmitter as new () => TypedEventEmitter<InstagramEvents>) {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
    this.main()
  }

  private async main() {
    const isLoggedin = await this.isInstagramLoggedIn();
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, instagramState.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, instagramState.NEED_LOG_IN)
    }
  }

  async isInstagramLoggedIn() {
    let isLoggedin = false

    await this.context.waitForSelector('xpath/' + instagramSelectors.mNewPost, { timeout: 1500 }).then(() => {
      isLoggedin = true
    }).catch(() => {
      // keep empty
    })

    this.context.waitForSelector('xpath/' + instagramSelectors.mCancelAddToHome).then(() => {
      this.context.click('xpath/' + instagramSelectors.mCancelAddToHome).catch(() => {
        // keep empty
      })
    }).catch(() => {
      // keep empty
    })

    this.context.waitForSelector('xpath/' + instagramSelectors.notNowBtn).then(() => {
      this.context.click('xpath/' + instagramSelectors.notNowBtn).catch(() => {
        // keep empty
      })
    }).catch(() => {
      // keep empty
    })

    this.context.waitForSelector(instagramSelectors.securityCode).then(() => {
      this.emit(STATE_CONSTANT, instagramState.INSTAGRAM_NEED_SECURITY_CODE)
    }).catch(() => {
      // keep empty
    })

    return isLoggedin
  }

  async instagramBeginLogin(username: string, password: string) {
    this.emit(STATE_CONSTANT, 'loading')
    const isLoginBtnExist = await this.context.$x(instagramSelectors.loginBtn)
    if (!!isLoginBtnExist && isLoginBtnExist.length > 0) {
      // only the parent is clickable
      const loginBtn = await isLoginBtnExist[0].$$('xpath/' + '..')
      loginBtn[0].click()

      // login process
      await this.context.waitForSelector(instagramSelectors.emailField)
      await this.context.type(instagramSelectors.emailField, username)
      await this.context.type(instagramSelectors.passwordField, password)

      await Promise.all([
        this.context.waitForNavigation({
          waitUntil: 'load'
        }),
        this.context.click(instagramSelectors.loginSubmitBtn)
      ])

      await this.context.waitForSelector(instagramSelectors.securityCode).then(() => {
        this.emit(STATE_CONSTANT, instagramState.INSTAGRAM_NEED_SECURITY_CODE)
      }).catch(() => {
        // logger.info('No security code needed')
      })

      const isLoggedin = await this.isInstagramLoggedIn();
      this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
      if (isLoggedin) {
        this.emit(STATE_CONSTANT, instagramState.LOGGED_IN)
      } else {
        this.emit(STATE_CONSTANT, instagramState.NEED_LOG_IN)
      }
    }
  }

  async securityCodeInput(code: string) {
    this.emit('instagram-state-change', 'loading')
    await this.context.click(instagramSelectors.securityCode, { count: 3 })
    await this.context.keyboard.press('Backspace')
    await this.context.type(instagramSelectors.securityCode, code)
    await this.context.waitForSelector('xpath/' + instagramSelectors.confirmVerifCode).then(async () => {
      await this.context.click('xpath/' + instagramSelectors.confirmVerifCode)
    })

    this.context.waitForSelector('xpath/' + instagramSelectors.wrongSecurityCode, { timeout: 0 }).then(() => {
      this.emit(STATE_CONSTANT, instagramState.WRONG_SECURITY_CODE)
    }).catch(() => {
      // keep empty
    })

    const loggedIn = await this.isInstagramLoggedIn()
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (!!loggedIn) {
      this.emit(STATE_CONSTANT, instagramState.SECURITY_CODE_DONE)
      this.context.waitForSelector('xpath/' + instagramSelectors.notNowDiv).then(() => {
        this.context.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
          // keep empty
        })
      }).catch(() => {
        // keep empty
      })
    }
  }

}

