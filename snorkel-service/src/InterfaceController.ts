import { KnownDevices, Page } from "puppeteer";
import { PupPage } from "./Client";
import { FacebookController } from "./facebook/Controller";
import { InstagramController } from "./instagram/Controller";
import { TwitterController } from "./twitter/Controller";
import config from "./config";

const iPhoneSE = KnownDevices['iPhone SE']
const { platforms } = config

export type IPlatfroms = 'facebook' | 'instagram' | 'twitter'

type ICtx = {
  [P in IPlatfroms]: PupPage
}

export const ctx: ICtx = {
  facebook: null,
  instagram: null,
  twitter: null
}

class InterfaceController {
  mainPage: Page
  facebook: FacebookController
  instagram: InstagramController
  twitter: TwitterController

  constructor(mainPage: Page) {
    this.mainPage = mainPage
  }

  async init() {
    const browser = this.mainPage.browser()

    await Promise.all(platforms.map(async platform => {
      const page = await browser.newPage()
      if (platform === 'facebook') {
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4')
        await page.emulate(iPhoneSE)
      }
      await page.goto(`https://www.${platform}.com`, {
        waitUntil: 'domcontentloaded'
      })

      ctx[platform] = page

      switch (platform) {
        case 'facebook':
          if (!!ctx.facebook) {
            this.facebook = new FacebookController(ctx.facebook)
            console.log('facebook instance created')
          }
          break;

        case 'instagram':
          if (!!ctx.instagram) {
            this.instagram = new InstagramController(ctx.instagram)
            console.log('instagram instance created')
          }
          break;

        case 'twitter':
          if (!!ctx.twitter) {
            this.twitter = new TwitterController(ctx.twitter)
            console.log('twitter instance created')
          }
          break;

        default:
          break;
      }
    }))
  }
}


export default InterfaceController
