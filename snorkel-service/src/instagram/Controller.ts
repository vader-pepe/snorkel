import selectors from "@/constants";
import { Page } from "puppeteer";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import path from "path";

const { instagramSelectors } = selectors
const STATE_CONSTANT = 'instagram-state-change'
const storage = path.resolve('./src/storage')

const instagramState = {
  ...State,
  INSTAGRAM_NEED_SECURITY_CODE: 'need-security-code',
  WRONG_SECURITY_CODE: 'wrong-security-code',
  SECURITY_CODE_DONE: 'security-code-handled',
} as const

type StateKeys = keyof typeof instagramState;
type StateValues = typeof instagramState[StateKeys];

export type InstagramEvents = {
  [STATE_CONSTANT]: (arg: StateValues) => void
}

export class InstagramController extends MyEventEmitter<InstagramEvents> {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
    this.context.evaluate(`function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }`)
  }

  wildcard() {

  }

  async newPost(media: string, post?: string) {
    await this.context.waitForSelector(instagramSelectors.mNewPost).then(async () => {
    }).catch(() => {
      throw new Error('Upload btn not found!')
    })

    await this.context.evaluate((selector) => {

      const allHome = Array.from(document.querySelectorAll(selector))
      // this is the best I can come with
      allHome[1]?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

    }, instagramSelectors.mNewPost)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.evaluate((selector) => {

        // @ts-ignore
        const post = window.getElementByXpath(selector)
        // this is the best I can come with
        post?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

      }, instagramSelectors.mPostSpan)
    ])

    await fileChooser.accept([`${storage}/${media}`]);

  }

  async isLoggedIn() {
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

    return isLoggedin
  }

  // important: your account will stuck at security code!
  // so you have to call securityCodeInput() after this one!
  async beginLogin(username: string, password: string) {
    let needSecurityCode = false
    this.emit(STATE_CONSTANT, instagramState.LOADING)
    await this.context.waitForSelector('input[aria-label="Phone number, username, or email"]').catch(() => {
      throw new Error('No Element found!')
    })

    // login process
    await this.context.type(`input[aria-label="Phone number, username, or email"]`, username)
    await this.context.type(`aria-label="Password"`, password)

    await this.context.click(instagramSelectors.loginSubmitBtn)

    await this.context.waitForSelector(instagramSelectors.securityCode).then(async () => {
      needSecurityCode = true
      await this.context.click(`input[type="checkbox"]`)
    }).catch(() => {
      // keep empty
    })

    const isLoggedin = await this.isLoggedIn();
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, instagramState.LOGGED_IN)
    } else {
      if (needSecurityCode) {
        this.emit(STATE_CONSTANT, instagramState.INSTAGRAM_NEED_SECURITY_CODE)
      } else {
        this.emit(STATE_CONSTANT, instagramState.NEED_LOG_IN)
      }
    }

  }

  // 6 digit numerical code
  async securityCodeInput(code: `${number}`) {
    this.emit(STATE_CONSTANT, instagramState.LOADING)
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

    const loggedIn = await this.isLoggedIn()
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

