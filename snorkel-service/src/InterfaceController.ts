import { KnownDevices, Page } from "puppeteer";
import { PupPage } from "./Client";
import { FacebookController } from "./facebook/Controller";
import { InstagramController } from "./instagram/Controller";
import { TwitterController } from "./twitter/Controller";
import config from "./config";

const { platforms } = config

const iphoneSe = KnownDevices['iPhone SE']

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
      if (platform === 'facebook') await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1')
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
