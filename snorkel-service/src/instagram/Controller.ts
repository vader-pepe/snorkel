import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import { addWatermarkToImage, addWatermarkToVideo } from "@/lib/addWatermark";

const { instagramSelectors } = selectors
const STATE_CONSTANT = 'instagram-state-change'

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
  }

  async createPost(media: string, caption?: string) {
    const imageRegex = /\.(jpe?g|png|gif|bmp)$/i
    const isImage = imageRegex.test(media)

    this.emit(STATE_CONSTANT, instagramState.LOADING)
    let processedMedia = media

    await this.context.waitForSelector('xpath/' + instagramSelectors.newPost).catch(() => {
      throw new Error('Upload btn not found!')
    })

    await this.context.click('xpath/' + instagramSelectors.newPost)
    await this.context.waitForSelector('xpath/' + instagramSelectors.selectFromComputer)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.click('xpath/' + instagramSelectors.selectFromComputer)
    ])

    await fileChooser.accept([processedMedia]);
    await this.context.waitForSelector('xpath/' + instagramSelectors.postNextStep)
    await this.context.click('xpath/' + instagramSelectors.okBtn).catch(() => {/* keep empty */ })
    await this.context.click('xpath/' + instagramSelectors.postNextStep)
    await this.context.click('xpath/' + instagramSelectors.postNextStep)
    if (!!caption) {
      await this.context.waitForSelector(instagramSelectors.caption)
      await this.context.type(instagramSelectors.caption, caption)
    }
    await this.context.waitForSelector('xpath/' + instagramSelectors.shareDiv)
    await this.context.click('xpath/' + instagramSelectors.shareDiv)
    await this.context.waitForSelector('xpath/' + instagramSelectors.sharedNotif, { timeout: 0 }).catch(() => {
      throw new Error('Something unexpected happened!')
    })
    await this.context.click('xpath/' + instagramSelectors.closeBtn)

    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    this.emit(STATE_CONSTANT, instagramState.POST_DONE)
  }

  async isLoggedIn() {
    let isLoggedin = false

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

    this.context.waitForSelector('xpath/' + instagramSelectors.notNowDiv).catch(() => {
      // keep empty
    })

    this.context.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
      // keep empty
    })

    await this.context.waitForSelector('xpath/' + instagramSelectors.newPost, { timeout: 1500 }).then(() => {
      isLoggedin = true
    }).catch(() => {
      // keep empty
    })

    return isLoggedin
  }

  // important: your account will stuck at security code!
  // so you have to call securityCodeInput() after this one!
  async login(username: string, password: string) {
    let needSecurityCode = false
    this.emit(STATE_CONSTANT, instagramState.LOADING)

    await this.context.waitForSelector('xpath/' + instagramSelectors.switchAccount).catch(() => { /* keep empty */ })
    await this.context.click('xpath/' + instagramSelectors.switchAccount).catch(() => { /* keep empty */ })

    await this.context.waitForSelector('xpath/' + instagramSelectors.emailField).catch(() => {
      throw new Error('Email field not found!')
    })

    // login process
    await this.context.type('xpath/' + instagramSelectors.emailField, username)
    await this.context.type('xpath/' + instagramSelectors.passwordField, password)

    await this.context.click(instagramSelectors.loginSubmitBtn)

    await this.context.waitForSelector(instagramSelectors.securityCode).then(async () => {
      needSecurityCode = true
    }).catch(() => {
      // keep empty
    })

    if (needSecurityCode) {
      await this.context.click('xpath/' + instagramSelectors.trustThisDevice)
      this.emit(STATE_CONSTANT, instagramState.INSTAGRAM_NEED_SECURITY_CODE)
    }

    await this.context.waitForSelector('xpath/' + instagramSelectors.notNowDiv).catch(() => {
      // keep empty
    })

    await this.context.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
      // keep empty
    })

    const isLoggedin = await this.isLoggedIn();
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, instagramState.LOGGED_IN)
    } else {
      this.emit(STATE_CONSTANT, instagramState.NEED_LOG_IN)
    }

  }

  // 6 digit numerical code
  async securityCodeInput(code: `${number}`) {
    this.emit(STATE_CONSTANT, instagramState.LOADING)
    await this.context.click(instagramSelectors.securityCode, { count: 3 })
    await this.context.keyboard.press('Backspace')
    await this.context.type(instagramSelectors.securityCode, code)
    await this.context.click('xpath/' + instagramSelectors.trustThisDevice)
    await this.context.waitForSelector('xpath/' + instagramSelectors.confirmVerifCode)
    await this.context.click('xpath/' + instagramSelectors.confirmVerifCode)

    await this.context.waitForSelector('xpath/' + instagramSelectors.wrongSecurityCode, { timeout: 0 }).then(() => {
      this.emit(STATE_CONSTANT, instagramState.WRONG_SECURITY_CODE)
    }).catch(() => {
      // keep empty
    })

    const loggedIn = await this.isLoggedIn()
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (loggedIn) {
      this.emit(STATE_CONSTANT, instagramState.SECURITY_CODE_DONE)
      await this.context.waitForSelector('xpath/' + instagramSelectors.notNowDiv).catch(() => {
        // keep empty
      })
      await this.context.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
        // keep empty
      })
    }
  }

}

