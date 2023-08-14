import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import path from "path";
import { sleep } from "@/utils";
import { addWatermarkToImage, addWatermarkToVideo } from "@/lib/addWatermark";

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

  async createPostWithMedia(media: string, caption?: string) {
    await this.context.bringToFront()
    const imageRegex = /\.(jpe?g|png|gif|bmp)$/i
    const isImage = imageRegex.test(media)
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    let processedMedia = media

    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
      throw new Error('Account not found!')
    }

    await this.context.waitForSelector('xpath/' + facebookSelectors.whatsOnYourmind)
    await this.context.click('xpath/' + facebookSelectors.whatsOnYourmind)

    await this.context.waitForSelector(isImage ? 'xpath/' + facebookSelectors.mNewPhotosPost : 'xpath/' + facebookSelectors.mNewVideoPost)
    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser({
        timeout: 3000
      }),
      this.context.click(isImage ? 'xpath/' + facebookSelectors.mNewPhotosPost : 'xpath/' + facebookSelectors.mNewVideoPost)
    ])

    await fileChooser.accept([processedMedia]);
    if (!!caption) {
      await this.context.waitForSelector('xpath/' + facebookSelectors.captionSpawner)
      await this.context.click('xpath/' + facebookSelectors.captionSpawner)
      await this.context.waitForSelector('xpath/' + facebookSelectors.captionTextarea)
      await this.context.type('xpath/' + facebookSelectors.captionTextarea, caption, { delay: 100 })
    }
    await this.context.click('xpath/' + facebookSelectors.submitPostBtn)
    await sleep(3000)
    await this.context.waitForSelector('xpath/' + facebookSelectors.postedToast, { timeout: 60000 }).catch(() => {
      throw new Error('Upload exceeded 60 seconds!')
    })

    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)
  }

  async createPost(caption: string) {
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
      throw new Error('Account not found!')
    }

    await this.context.waitForSelector('xpath/' + facebookSelectors.whatsOnYourmind)
    await this.context.click('xpath/' + facebookSelectors.whatsOnYourmind)

    await this.context.waitForSelector('xpath/' + facebookSelectors.captionSpawner)
    await this.context.click('xpath/' + facebookSelectors.captionSpawner)
    await this.context.waitForSelector('xpath/' + facebookSelectors.captionTextarea)
    await this.context.type('xpath/' + facebookSelectors.captionTextarea, caption, { delay: 100 })

    await this.context.click('xpath/' + facebookSelectors.submitPostBtn)
    await sleep(1500)
    await this.context.waitForSelector('xpath/' + facebookSelectors.postedToast)
    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)

  }

  async isLoggedIn() {
    let alreadyLoggedIn = false

    await this.context.waitForSelector('xpath/' + facebookSelectors.mStatusFieldXpath).then(() => {
      alreadyLoggedIn = true
    }).catch(() => {
      // keep empty
    })

    return alreadyLoggedIn
  }

  async login(username: string, password: string) {
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    await this.context.type(facebookSelectors.mEmailField, username, { delay: 100 })
    await this.context.type(facebookSelectors.mPassField, password, { delay: 100 })
    await this.context.waitForSelector(facebookSelectors.mLoginBtn)

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
