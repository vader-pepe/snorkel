import selectors from "@/constants";
import { Page } from "puppeteer-core";
import { MyEventEmitter } from "@/utils/CustomEventEmitter";
import { State } from "@/constants/Events";
import path from "path";
import { sleep } from "@/utils";
const storage = path.resolve('./src/storage')

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
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, State.LOADING)
    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      throw new Error('Account not detected!')
    }

    await this.context.waitForSelector(twitterSelectors.mNewTweet)
    await this.context.click(twitterSelectors.mNewTweet)
    await sleep(500)

    await this.context.click('xpath/' + twitterSelectors.mMaybeLater).catch(() => {/* keep empty */ })

    await this.context.waitForSelector(twitterSelectors.mComposeTweet)
    await this.context.type(twitterSelectors.mComposeTweet, caption, { delay: 100 })
    await sleep(500)
    await this.context.click('xpath/' + twitterSelectors.mSendTweet)
    await sleep(500)
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
    await this.context.bringToFront()
    const imageRegex = /\.(jpe?g|png|gif|bmp)$/i
    const isImage = imageRegex.test(media)
    await sleep(500)
    this.emit(STATE_CONSTANT, State.LOADING)
    let processedMedia = media

    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      throw new Error('Account not detected!')
    }

    await this.context.screenshot()
    await this.context.waitForSelector(twitterSelectors.mNewTweet)
    await this.context.click(twitterSelectors.mNewTweet)

    await this.context.click('xpath/' + twitterSelectors.mMaybeLater).catch(() => {/* keep empty */ })
    await this.context.waitForSelector(twitterSelectors.mAddPhotosOrVideos)

    const [fileChooser] = await Promise.all([
      this.context.waitForFileChooser(),
      this.context.click(twitterSelectors.mAddPhotosOrVideos),
    ])
    await sleep(500)

    await fileChooser.accept([processedMedia])
    if (!isImage) {
      await this.context.waitForSelector('xpath/' + twitterSelectors.uploadedNotif, { timeout: 0 })
    }

    if (!!caption) {
      await this.context.waitForSelector(twitterSelectors.mComposeTweet)
      await this.context.type(twitterSelectors.mComposeTweet, caption, { delay: 100 })
    }
    await this.context.click('xpath/' + twitterSelectors.mSendTweet)
    await sleep(500)
    await this.context.waitForSelector(twitterSelectors.mNewTweet).catch(() => {
      throw new Error('Something unexpected happened!')
    })

    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    this.emit(STATE_CONSTANT, twitterState.POST_DONE)
  }

  async getPost() {
    await this.context.bringToFront()
    this.emit(STATE_CONSTANT, State.LOADING)
    const isLoggedIn = await this.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Account not found!')
    }

    await sleep(1000)

    await this.context.waitForSelector('xpath/' + twitterSelectors.sidebar)
    await this.context.click('xpath/' + twitterSelectors.sidebar)

    await Promise.all([
      this.context.waitForNavigation(),
      this.context.click('xpath/' + twitterSelectors.profile)
    ])

    await this.context.waitForSelector('xpath/' + twitterSelectors.firstTweet)

    type PostsIF = Array<{
      type: string
      name?: string
      username: string
      caption?: string
      media?: string
      comments: number
      retweets: number
      likes: number
      views: number
    }>
    await sleep(800)
    const posts: PostsIF = await this.context.evaluate((selector) => {
      scroll(0, 500);
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

      var postsContainer = Array.from($x(selector.firstTweet))
      const temp = postsContainer.map(post => {
        // @ts-ignore
        const name = post?.querySelector(selector.username)?.querySelectorAll(`a`)[0]?.textContent
        // @ts-ignore
        const username = post?.querySelector(selector.username).querySelectorAll(`a`)[1]?.textContent
        // @ts-ignore
        const type = post?.querySelector(selector.postType)?.textContent
        // @ts-ignore
        const caption = post?.querySelector(selector.caption)?.innerHTML
        // @ts-ignore
        const media = post?.querySelector(selector.contentVid)?.href || post?.querySelector(selector.contentImg)?.querySelector(`img`)?.src
        // @ts-ignore
        const stats = post?.querySelector(selector.stats).ariaLabel
        const statsSplit = stats.split(", ")
        // @ts-ignore
        const statsObj = {
          retweets: 0,
          likes: 0,
          views: 0,
          comments: 0,
        }
        for (const item of statsSplit) {
          if (item.includes('repost')) {
            // @ts-ignore
            statsObj.retweets = parseInt(item, 10);
          } else if (item.includes('like')) {
            // @ts-ignore
            statsObj.likes = parseInt(item, 10);
          } else if (item.includes('view')) {
            // @ts-ignore
            statsObj.views = parseInt(item, 10);
          } else if (item.includes('repl')) {
            // @ts-ignore
            statsObj.comments = parseInt(item, 10)
          }
        }
        return {
          type: type || "post",
          name: name || '',
          username: username,
          caption: caption || null,
          media: media || null,
          comments: statsObj.comments,
          retweets: statsObj.retweets,
          likes: statsObj.likes,
          views: statsObj.views,
        }
      })
      return temp
    }, {
      firstTweet: twitterSelectors.firstTweet,
      username: twitterSelectors.username,
      postType: twitterSelectors.postType,
      caption: twitterSelectors.caption,
      contentVid: twitterSelectors.contentVid,
      contentImg: twitterSelectors.contentImg,
      stats: twitterSelectors.stats
    })
    this.emit(STATE_CONSTANT, State.LOADING_DONE)
    return posts
  }

}
