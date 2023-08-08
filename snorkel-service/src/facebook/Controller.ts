import selectors from "@/constants";
import { Page } from "puppeteer";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import path from "path";

const STATE_CONSTANT = 'facebook-state-change'
const storage = path.resolve('./src/storage')
const { facebookSelectors } = selectors

const facebookState = {
  ...State,
} as const

type StateKeys = keyof typeof facebookState;
type StateValues = typeof facebookState[StateKeys];

export type FacebookEvents = {
  [STATE_CONSTANT]: (arg: StateValues) => void
}

export class FacebookController extends MyEventEmitter<FacebookEvents> {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
  }

  wildCard() {

  }

  async newPhotosPost(media: string, newStatus?: string) {
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
      throw new Error('Account not found!')
    }

    await this.context.waitForSelector(facebookSelectors.mNewPost)

    await Promise.all([
      this.context.waitForNavigation({
        waitUntil: 'load'
      }),
      this.context.click(facebookSelectors.mNewPost)
    ])

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser({
        timeout: 3000
      }),
      this.context.waitForSelector(facebookSelectors.mNewPhotosPost).then(() => {
        this.context.click(facebookSelectors.mNewPhotosPost)
      })
    ])

    await fileChooser.accept([`${storage}/${media}`]);
    if (!!newStatus) {
      await this.context.type(facebookSelectors.mStatusField, newStatus, { delay: 100 })
    }
    // weird Facebook behaviour
    await this.context.evaluate((selector) => {
      const btn = document.querySelector(selector)
      // @ts-ignore
      btn.click()
    }, facebookSelectors.mPostBtn)

    // dialog leaving Facebook will appear for no reason
    this.context.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)
  }

  async newTextPost(newStatus: string) {
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
      throw new Error('Account not found!')
    }

    await this.context.waitForSelector(facebookSelectors.mNewPost)

    await Promise.all([
      this.context.waitForNavigation({
        waitUntil: 'load'
      }),
      this.context.click(facebookSelectors.mNewPost)
    ])

    await this.context.type(facebookSelectors.mStatusField, newStatus, { delay: 100 })
    // weird Facebook behaviour
    await this.context.evaluate((selector) => {
      let btn = document.querySelector(selector) as HTMLButtonElement
      btn.click()
    }, facebookSelectors.mPostBtn)

    // dialog leaving Facebook will appear for no reason
    this.context.on('dialog', async dialog => {
      await dialog.dismiss();
    });
    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)

  }

  async isLoggedIn() {
    let alreadyLoggedIn = false

    await this.context.waitForSelector('xpath/' + facebookSelectors.mStatusFieldXpath, { timeout: 3000 }).then(async () => {
      alreadyLoggedIn = true
    }).catch(() => {
      // keep empty
    })

    return alreadyLoggedIn
  }

  async beginLogin(username: string, password: string) {
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    await this.context.type(facebookSelectors.mEmailField, username, { delay: 100 })
    await this.context.type(facebookSelectors.mPassField, password, { delay: 100 })
    await this.context.waitForSelector(facebookSelectors.mLoginBtn)

    // weird behaviour. if the page is not screenshoted,
    // the page will not navigated.
    await this.context.screenshot({
      path: `${storage}/login.png`,
      type: 'png'
    })

    await Promise.all([
      this.context.waitForNavigation({
        waitUntil: 'domcontentloaded',
      }),
      this.context.click(facebookSelectors.mLoginBtn)
    ])

    await this.context.evaluate((selector) => {
      const notNow = document.querySelector(selector) as HTMLAnchorElement
      if (!!notNow) {
        notNow.click()
      }
    }, facebookSelectors.mNotNow)

    const isLoggedin = await this.isLoggedIn();
    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, facebookState.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, facebookState.NEED_LOG_IN)
    }
  }

}
