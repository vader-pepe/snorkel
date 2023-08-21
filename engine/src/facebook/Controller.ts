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
    if (this.context.url() !== 'https://m.facebook.com/') {
      await Promise.all([
        this.context.waitForNavigation({
          waitUntil: 'domcontentloaded'
        }),
        this.context.goto('https://m.facebook.com/')
      ])
    }
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

    await this.context.waitForSelector('xpath/' + facebookSelectors.postsHeader)
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
      // @ts-ignore
      let elementsNotMeetingCondition = []
      // @ts-ignore
      let posts = []
      let postsHeader = $x(selector.header)
      let postsFooter = $x(selector.footer)
      // @ts-ignore
      function collectElementsUntilCondition(element, targetElement, condition, collectedElements = []) {
        if (!element || element === targetElement) {
          return collectedElements;
        }

        if (!condition(element)) {
          // @ts-ignore
          collectedElements.push(element);
        }

        if (!collectedElements.length) {
          // Store the first element that doesn't meet the condition
          // @ts-ignore
          collectedElements.push(element);
        }

        return collectElementsUntilCondition(element.nextElementSibling, targetElement, condition, collectedElements);
      }

      // Include the last element if the target wasn't found
      if (elementsNotMeetingCondition.length) {
        // @ts-ignore
        elementsNotMeetingCondition.push(elementsNotMeetingCondition[elementsNotMeetingCondition.length - 1].nextElementSibling);
      }

      // @ts-ignore
      let temp = []
      // @ts-ignore
      posts = postsHeader.map((header, index) => {
        const elementsNotMeetingCondition = collectElementsUntilCondition(
          header,
          postsFooter[index],
          // @ts-ignore
          () => {
            // Define your condition here
            return
          }
        );

        // Include the last element if the target wasn't found
        if (elementsNotMeetingCondition.length) {
          elementsNotMeetingCondition.push(elementsNotMeetingCondition[elementsNotMeetingCondition.length - 1].nextElementSibling);
        }
        return elementsNotMeetingCondition
      })

      for (let i = 0; i < posts.length; i++) {
        temp.push({
          // not a good way to get data
          name: posts[i][0]?.children?.[0]?.children?.[1]?.children?.[0]?.textContent || null,
          caption: posts[i][1]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.innerHTML || null,
          otherCaption: posts[i][2]?.children?.[0]?.children?.[4]?.textContent || null,
          media: posts[i][2]?.children?.[0]?.children?.[0]?.children?.[0]?.innerHTML || null,
          likes: posts[i][4]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[1]?.textContent || 0,
          comments: posts[i][4]?.children?.[1]?.children?.[0]?.children?.[0]?.textContent || 0,
        })
      }
      return temp

    }, { header: facebookSelectors.postsHeader, footer: facebookSelectors.postsFooter })

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
