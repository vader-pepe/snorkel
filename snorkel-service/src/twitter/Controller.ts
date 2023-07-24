import selectors from "@/constants";
import { Page } from "puppeteer";
import { EventEmitter } from 'events'

const { twitterSelectors } = selectors

export class TwitterController extends EventEmitter {
  private context: Page

  constructor(context: Page) {
    super()
    this.context = context
    this.main()
  }

  private async main() {
    this.context.waitForSelector('xpath/' + twitterSelectors.mNotNow).then(() => {
      this.context.click('xpath/' + twitterSelectors.mNotNow)
    }).catch(() => {
      // keep empty
    })

    const isLoggedin = await this.isTwitterLoggedIn()
    this.emit('twitter-state-change', 'loading-done')
    if (isLoggedin) {
      this.emit('twitter-state-change', 'logged-in')
    } else {
      this.emit('twitter-state-change', 'need-log-in')
    }
  }

  async isTwitterLoggedIn() {
    let isLoggedin = false

    await this.context.waitForSelector(twitterSelectors.mNewTweet, { timeout: 1000 }).then(() => {
      isLoggedin = true
    }).catch(() => {
      // keep empty
    })

    return isLoggedin
  }

}
