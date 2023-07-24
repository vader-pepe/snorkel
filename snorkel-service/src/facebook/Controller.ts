import selectors from "@/constants";
import { Page } from "puppeteer";
import { EventEmitter } from 'events'
import TypedEmitter from "typed-emitter"
import { State, StateValues } from "@/constants/Events";
const { facebookSelectors } = selectors

const STATE_CONSTANT = 'facebook-state-change'

export type FacebookEvents = {
  [STATE_CONSTANT]: (arg: StateValues) => void
}

export class FacebookController extends (EventEmitter as new () => TypedEmitter<FacebookEvents>) {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
    this.main()
  }

  private async main() {
    const isLoggedin = await this.isFacebookLoggedIn();

    if (isLoggedin) {
      this.emit(STATE_CONSTANT, State.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, State.NEED_LOG_IN)
    }
  }

  async facebookNewTextStatus(newStatus: string) {

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

    // logger.info("Successfully post a status")
  }

  async isFacebookLoggedIn() {
    let alreadyLoggedIn = false

    await this.context.waitForSelector('xpath/' + facebookSelectors.mStatusFieldXpath, { timeout: 1500 }).then(async () => {
      alreadyLoggedIn = true
    }).catch(() => {
      // keep empty
    })

    return alreadyLoggedIn
  }

  async facebookBeginLogin(username: string, password: string) {
    this.emit(STATE_CONSTANT, State.LOADING)
    await this.context.type(facebookSelectors.mEmailField, username, { delay: 100 })
    await this.context.type(facebookSelectors.mPassField, password, { delay: 100 })
    await this.context.waitForSelector(facebookSelectors.mLoginBtn),

      await Promise.all([
        this.context.waitForNavigation({
          waitUntil: 'load'
        }),
        this.context.click(facebookSelectors.mLoginBtn)
      ])

    this.context.evaluate((selector) => {
      const notNow = document.querySelector(selector) as HTMLAnchorElement
      if (!!notNow) {
        notNow.click()
      }
    }, facebookSelectors.mNotNow)

    const isLoggedin = await this.isFacebookLoggedIn();
    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, State.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, State.NEED_LOG_IN)
    }
  }
}
