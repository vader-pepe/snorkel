import path from "path";
import fs from "fs/promises"
import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import { sleep } from "@/utils";
const storage = path.resolve('./src/storage')

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
    await this.context.bringToFront()
    const imageRegex = /\.(jpe?g|png|gif|bmp)$/i
    const isImage = imageRegex.test(media)

    this.emit(STATE_CONSTANT, instagramState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('No account detected!')
    }
    let processedMedia = media

    await this.context.waitForSelector('xpath/' + instagramSelectors.newPost).catch(() => {
      throw new Error('Upload btn not found!')
    })
    await this.context.screenshot({
      path: `${storage}/dump.png`,
      type: 'png'
    })
    await this.context.click('xpath/' + instagramSelectors.newPost)
    await this.context.waitForSelector('xpath/' + instagramSelectors.selectFromComputer)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.click('xpath/' + instagramSelectors.selectFromComputer)
    ])

    await fileChooser.accept([processedMedia]);
    await this.context.waitForSelector('xpath/' + instagramSelectors.postNextStep)
    await sleep(500)
    await this.context.click('xpath/' + instagramSelectors.okBtn).catch(() => {/* keep empty */ })
    await this.context.click('xpath/' + instagramSelectors.selectCrop)
    await this.context.waitForSelector('xpath/' + instagramSelectors.original)
    await this.context.click('xpath/' + instagramSelectors.original)
    await sleep(500)
    await this.context.click('xpath/' + instagramSelectors.postNextStep)
    await this.context.click('xpath/' + instagramSelectors.postNextStep)
    if (!!caption) {
      await this.context.waitForSelector(instagramSelectors.caption)
      await this.context.type(instagramSelectors.caption, caption, { delay: 100 })
    }
    await this.context.waitForSelector('xpath/' + instagramSelectors.shareDiv)
    await this.context.screenshot({
      path: `${storage}/dump.png`,
      type: 'png'
    })
    await this.context.click('xpath/' + instagramSelectors.shareDiv)
    await this.context.waitForSelector('xpath/' + instagramSelectors.sharedNotif, { timeout: 60000 }).catch(() => {
      throw new Error('Upload exceeded 60 seconds!')
    })
    await sleep(500)
    await this.context.click('xpath/' + instagramSelectors.closeBtn)

    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    this.emit(STATE_CONSTANT, instagramState.POST_DONE)
    await fs.unlink(`${storage}/dump.png`).catch(() => { /* keep empty */ })
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
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, instagramState.LOADING)

    await this.context.waitForSelector('xpath/' + instagramSelectors.switchAccount).catch(() => { /* keep empty */ })
    await this.context.click('xpath/' + instagramSelectors.switchAccount).catch(() => { /* keep empty */ })

    await this.context.waitForSelector('xpath/' + instagramSelectors.emailField).catch(() => {
      throw new Error('Email field not found!')
    })

    // login process
    await this.context.type('xpath/' + instagramSelectors.emailField, username)
    await this.context.type('xpath/' + instagramSelectors.passwordField, password)
    await this.context.screenshot({
      path: `${storage}/dump.png`,
      type: 'png'
    })

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

    const isLoggedin = await this.isLoggedIn();
    await fs.unlink(`${storage}/dump.png`).catch(() => { /* keep empty */ })
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    if (isLoggedin) {
      this.emit(STATE_CONSTANT, instagramState.LOGGED_IN)
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

    await this.context.waitForSelector('xpath/' + instagramSelectors.notNowDiv).catch(() => {
      // keep empty
    })

    await this.context.click('xpath/' + instagramSelectors.notNowDiv).catch(() => {
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

  async getPost() {
    await this.context.bringToFront()
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Account not found!')
    }
    this.emit(STATE_CONSTANT, instagramState.LOADING)
    await this.context.screenshot({
      path: `${storage}/dump.png`,
      type: 'png'
    })

    await this.context.evaluate((selector) => {

      // @ts-ignore
      function $x(text, ctx = null) {
        var results = [];
        var xpathResult = document.evaluate(
          text,
          ctx || document,
          null,
          XPathResult.ORDERED_NODE_ITERATOR_TYPE,
          null
        );
        var node;
        while ((node = xpathResult.iterateNext()) != null) {
          results.push(node);
        }
        return results;
      }

      // @ts-ignore
      $x(selector)[0].click()
    }, instagramSelectors.profile)

    let postUrls: Array<string> = []

    await this.context.waitForSelector('xpath/' + instagramSelectors.changeProfilePhoto)
    postUrls = await this.context.evaluate((selector) => {

      // @ts-ignore
      function $x(text, ctx = null) {
        var results = [];
        var xpathResult = document.evaluate(
          text,
          ctx || document,
          null,
          XPathResult.ORDERED_NODE_ITERATOR_TYPE,
          null
        );
        var node;
        while ((node = xpathResult.iterateNext()) != null) {
          results.push(node);
        }
        return results;
      }

      // @ts-ignore
      const postsContainer = $x(selector)
      // @ts-ignore
      let urls = []

      for (let i = 0; i < postsContainer.length; i++) {
        // @ts-ignore
        urls.push(postsContainer[i]?.children?.[0]?.href || '')
      }

      return urls
    }, instagramSelectors.postsContainer)

    const posts: Array<{
      name: string
      caption: string
      likes: string
      media: string
    }> = []

    for (let i = 0; i < postUrls.length; i++) {
      const isLoggedIn = await this.isLoggedIn()
      if (!isLoggedIn) {
        throw new Error('Account not found!')
      }

      await Promise.all([
        this.context.waitForNavigation({
          waitUntil: 'domcontentloaded'
        }),
        this.context.goto(postUrls[i]),
      ])

      await this.context.screenshot({
        path: `${storage}/dump.png`,
        type: 'png'
      })

      await this.context.waitForSelector('xpath/' + instagramSelectors.contentContainer)
      await sleep(500)
      const temp = await this.context.evaluate((selector) => {
        // @ts-ignore
        function $x(text, ctx = null) {
          var results = [];
          var xpathResult = document.evaluate(
            text,
            ctx || document,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
          );
          var node;
          while ((node = xpathResult.iterateNext()) != null) {
            results.push(node);
          }
          return results;
        }

        const media = $x(selector.contentMedia.contentVid)[0] || $x(selector.contentMedia.contentImg)[0]

        return {
          // @ts-ignore
          name: document.querySelector('header')?.textContent || '',
          // @ts-ignore
          caption: $x(selector.contentCaption)?.[0]?.children?.[0]?.children?.[1]?.children?.[0]?.children?.[2]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[1]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[1]?.innerHTML || '',
          likes: $x(selector.contentLikesCount)?.[0]?.textContent || '',
          // @ts-ignore
          media: media?.src || ''
        }
      }, {
        contentPoster: instagramSelectors.contentPoster,
        contentCaption: instagramSelectors.contentCaption,
        contentLikesCount: instagramSelectors.contentLikesCount,
        contentMedia: {
          contentImg: instagramSelectors.contentImg,
          contentVid: instagramSelectors.contentVid,
        },
      })
      posts.push(temp)
    }
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
    await fs.unlink(`${storage}/dump.png`).catch(() => { /* keep empty */ })
    return posts
  }

  async deletePost(url: string) {
    await this.context.bringToFront()
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Account not found!')
    }
    this.emit(STATE_CONSTANT, instagramState.LOADING)
    await Promise.all([
      this.context.waitForNavigation(),
      this.context.goto(url)
    ])

    await this.context.waitForSelector('xpath/' + instagramSelectors.postMenu)
    await sleep(1000)
    await this.context.click('xpath/' + instagramSelectors.postMenu)
    await sleep(1000)

    await this.context.waitForSelector('xpath/' + instagramSelectors.deleteBtn)
    await sleep(1000)
    await this.context.click('xpath/' + instagramSelectors.deleteBtn)
    await sleep(1000)

    await this.context.waitForSelector('xpath/' + instagramSelectors.deleteSure)
    await sleep(1000)
    await this.context.click('xpath/' + instagramSelectors.deleteBtn)
    this.emit(STATE_CONSTANT, instagramState.LOADING_DONE)
  }

}

