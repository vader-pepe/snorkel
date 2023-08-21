import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { State } from "@/constants/Events";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import path from "path";
import { sleep } from "@/utils";

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

    await this.context.waitForSelector('xpath/' + facebookSelectors.captionTextarea)
    await this.context.type('xpath/' + facebookSelectors.captionTextarea, (caption || ''), { delay: 100 })
    await this.context.click(facebookSelectors.newPhotoOrVideoPost)
    await this.context.waitForSelector('xpath/' + facebookSelectors.mediaInput)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.click('xpath/' + facebookSelectors.mediaInput)
    ])

    await fileChooser.accept([processedMedia]);
    await sleep(1000)
    await this.context.click(facebookSelectors.submitPostBtn)
    await sleep(3000)
    await this.context.waitForSelector(facebookSelectors.postedToast, { timeout: 60000 }).catch(() => {
      throw new Error('Upload exceeded 60 seconds!')
    })

    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)
    await this.context.reload().catch(() => {/* keep empty */ })
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

    await this.context.waitForSelector('xpath/' + facebookSelectors.captionTextarea)
    await this.context.type('xpath/' + facebookSelectors.captionTextarea, caption, { delay: 100 })

    await this.context.click(facebookSelectors.submitPostBtn)
    await sleep(1000)
    await this.context.waitForSelector(facebookSelectors.postedToast)
    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    this.emit(STATE_CONSTANT, facebookState.POST_DONE)
    await this.context.reload().catch(() => {/* keep empty */ })
  }

  async isLoggedIn() {
    let alreadyLoggedIn = false

    await this.context.waitForSelector('xpath/' + facebookSelectors.statusFieldXpath, { timeout: 30000 }).then(() => {
      alreadyLoggedIn = true
    }).catch(() => {
      // keep empty
    })

    return alreadyLoggedIn
  }

  async login(username: string, password: string) {
    await this.context.bringToFront()
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

  async getPosts(number = 1) {
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Account not found!')
    }

    await Promise.all([
      this.context.waitForNavigation({
        waitUntil: 'domcontentloaded'
      }),
      this.context.goto('https://www.facebook.com/profile.php'),
    ])

    await this.context.waitForSelector('xpath/' + facebookSelectors.posts)
    let posts: Array<{
      name: string
      caption: string | null
      otherCaption: string | null
      media: string | null
      likes: number
      comments: number
    }> = []

    posts = await this.context.evaluate((selector) => {
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

      const seeMore = Array.from($x(`//*[contains(text(),"See more")]`))
      // @ts-ignore
      seeMore.map((post) => post.click())

      const postsContainer = Array.from($x(selector))
      // @ts-ignore
      let temp = []
      for (let i = 0; i < postsContainer.length; i++) {
        // @ts-ignore
        const media = postsContainer[i]?.querySelector(`video`)?.src || postsContainer[i]?.querySelector(`img[referrerpolicy="origin-when-cross-origin"]`)?.src || null
        temp.push({
          // @ts-ignore
          name: postsContainer[i]?.querySelector('h2').textContent || '',
          // @ts-ignore
          caption: postsContainer[i]?.querySelector(`[data-ad-comet-preview="message"]`)?.querySelector(`span`)?.innerHTML || '',
          // @ts-ignore
          otherCaption: postsContainer[i]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[7]?.children?.[0]?.children?.[0]?.children?.[2]?.children?.[0]?.children?.[0]?.children?.[1]?.children?.[0]?.innerHTML || '',
          media,
          // @ts-ignore
          likes: postsContainer[i]?.querySelector(`div[role="button"] > span[aria-hidden="true"]`)?.textContent || 0,
          // @ts-ignore
          comments: postsContainer[i]?.querySelector(`div[role="button"] > span[dir="auto"]`)?.textContent || 0,
        })
      }
      return temp
    }, facebookSelectors.posts)

    this.emit(STATE_CONSTANT, facebookState.LOADING_DONE)
    return posts
  }

  async editPost(url: string) {
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, facebookState.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Account not found!')
    }

    // https://www.facebook.com/100030460027249/posts/pfbid0rPMFqZbCd4nGSCSCoqDFjFu4DTp7egHy9dLjMT5oLmjSrmxQN5GPwiQscw1cYSrul/?app=fbl


  }

}
