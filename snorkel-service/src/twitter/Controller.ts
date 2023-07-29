import selectors from "@/constants";
import { Page } from "puppeteer";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import { State } from "@/constants/Events";
import path from "path";

const { twitterSelectors } = selectors
const STATE_CONSTANT = 'twitter-state-change'
const storage = path.resolve('./src/storage')

const twitterState = {
  ...State,
} as const

type StateKeys = keyof typeof twitterState;
type StateValues = typeof twitterState[StateKeys];

export type TwitterEvents = {
  [STATE_CONSTANT]: (arg: StateValues) => void
}

export class TwitterController extends MyEventEmitter<TwitterEvents> {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
    this.context.evaluate(`
        function getElementByXpath(path) {
          return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }`)
  }

  async newMediaPost(media: string, post?: string) {
    this.emit(STATE_CONSTANT, twitterState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      this.emit(STATE_CONSTANT, twitterState.LOADING_DONE)
      throw new Error('Account not found!')
    }

    await this.context.waitForSelector(twitterSelectors.mNewTweet)

    await Promise.all([
      this.context.waitForNavigation({
        waitUntil: 'load'
      }),
      this.context.click(twitterSelectors.mNewTweet)
    ])

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser({
        timeout: 3000
      }),
      this.context.waitForSelector(twitterSelectors.mAddPhotos).then(() => {
        this.context.click(twitterSelectors.mAddPhotos)
      })
    ])

    await fileChooser.accept([`${storage}/${media}`]);
    if (!!post) {
      await this.context.type(twitterSelectors.mComposeTweet, post)
      await this.context.evaluate((selector) => {
        // @ts-ignore
        const sendTwtBtn = window.getElementByXpath(selector)
        // @ts-ignore
        sendTwtBtn.parentElement.parentElement.parentElement.click()
      }, twitterSelectors.mSendTweet)
    }

    this.emit(STATE_CONSTANT, twitterState.LOADING_DONE)
    this.emit(STATE_CONSTANT, twitterState.POST_DONE)

  }

  async newTextPost(post: string) {
    this.emit(STATE_CONSTANT, State.LOADING)
    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      throw new Error('Account not detected!')
    }

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click(twitterSelectors.mNewTweet)
    ])

    await this.context.waitForSelector(twitterSelectors.mComposeTweet)
    await this.context.type(twitterSelectors.mComposeTweet, post)
    await this.context.evaluate((selector) => {
      // @ts-ignore
      const sendTwtBtn = window.getElementByXpath(selector)
      // @ts-ignore
      sendTwtBtn.parentElement.parentElement.parentElement.click()
    }, twitterSelectors.mSendTweet)

    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    this.emit(STATE_CONSTANT, twitterState.POST_DONE)
  }

  async beginLogin(username: string, password: string) {
    this.emit(STATE_CONSTANT, State.LOADING)
    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click(twitterSelectors.mLoginBtn)
    ])
    await this.context.waitForSelector(twitterSelectors.mUsernameField)
    await this.context.type(twitterSelectors.mUsernameField, username)
    await this.context.evaluate((selector) => {
      // @ts-ignore
      const nextBtn = window.getElementByXpath(selector)
      // @ts-ignore
      nextBtn.parentElement.parentElement.parentElement.click()
    }, twitterSelectors.mNextStep)

    await this.context.waitForSelector(twitterSelectors.mPasswordField)
    await this.context.type(twitterSelectors.mPasswordField, password)

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.evaluate((selector) => {
        // @ts-ignore
        const loginBtn = window.getElementByXpath(selector)
        // @ts-ignore
        loginBtn.parentElement.parentElement.parentElement.click()
      }, twitterSelectors.mLoginBtn)

    ])

    const isLoggedIn = await this.isLoggedIn()
    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    if (isLoggedIn) {
      this.emit(STATE_CONSTANT, State.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, State.NEED_LOG_IN)
    }
  }

  async isLoggedIn() {
    let isLoggedin = false

    await this.context.waitForSelector(twitterSelectors.mNewTweet, { timeout: 1000 }).then(() => {
      isLoggedin = true
    }).catch(() => {
      // keep empty
    })

    return isLoggedin
  }

}
