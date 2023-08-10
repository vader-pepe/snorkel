import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import { State } from "@/constants/Events";
import { addWatermarkToImage, addWatermarkToVideo, getVideoMetadata } from "@/lib/addWatermark";

const { twitterSelectors } = selectors
const STATE_CONSTANT = 'twitter-state-change'

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
  }

  async createPost(caption: string) {
    this.emit(STATE_CONSTANT, State.LOADING)
    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      throw new Error('Account not detected!')
    }

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click(twitterSelectors.mNewTweet)
    ])

    await this.context.click('xpath/' + twitterSelectors.mMaybeLater).catch(() => {/* keep empty */ })

    await this.context.waitForSelector(twitterSelectors.mComposeTweet)
    await this.context.type(twitterSelectors.mComposeTweet, caption)
    await this.context.click('xpath/' + twitterSelectors.mSendTweet)
    await this.context.waitForSelector(twitterSelectors.mNewTweet).catch(() => {
      throw new Error('Something unexpected happened!')
    })

    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    this.emit(STATE_CONSTANT, twitterState.POST_DONE)
  }

  async login(username: string, password: string) {
    this.emit(STATE_CONSTANT, State.LOADING)
    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click(twitterSelectors.mSigninBtn)
    ])
    await this.context.waitForSelector(twitterSelectors.mUsernameField)
    await this.context.type(twitterSelectors.mUsernameField, username, { delay: 100 })
    await this.context.click('xpath/' + twitterSelectors.mNextStep)

    await this.context.waitForSelector(twitterSelectors.mPasswordField)
    await this.context.type(twitterSelectors.mPasswordField, password, { delay: 100 })

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click('xpath/' + twitterSelectors.mLoginBtn)
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

  async createPostWithMedia(media: string, caption?: string) {
    const imageRegex = /\.(jpe?g|png|gif|bmp)$/i
    const isImage = imageRegex.test(media)
    this.emit(STATE_CONSTANT, State.LOADING)
    let processedMedia = media

    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      throw new Error('Account not detected!')
    }

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click(twitterSelectors.mNewTweet)
    ])

    await this.context.click('xpath/' + twitterSelectors.mMaybeLater).catch(() => {/* keep empty */ })
    await this.context.waitForSelector(twitterSelectors.mAddPhotosOrVideos)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.click(twitterSelectors.mAddPhotosOrVideos),
    ])

    await fileChooser.accept([processedMedia])
    if (!isImage) {
      await this.context.waitForSelector('xpath/' + twitterSelectors.uploadedNotif, { timeout: 0 })
    }

    if (!!caption) {
      await this.context.waitForSelector(twitterSelectors.mComposeTweet)
      await this.context.type(twitterSelectors.mComposeTweet, caption)
    }
    await this.context.click('xpath/' + twitterSelectors.mSendTweet)
    await this.context.waitForSelector(twitterSelectors.mNewTweet).catch(() => {
      throw new Error('Something unexpected happened!')
    })

    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    this.emit(STATE_CONSTANT, twitterState.POST_DONE)
  }

}
