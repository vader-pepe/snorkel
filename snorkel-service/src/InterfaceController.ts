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
    this.main()
  }

  main = async () => {
    const browser = this.mainPage.browser()
    platforms.forEach(async platform => {
      const page = await browser.newPage()
      await page.emulate(iphoneSe)
      await page.goto(`https://www.${platform}.com`, {
        waitUntil: 'load'
      })

      ctx[platform] = page

      switch (platform) {
        case 'facebook':
          if (!!ctx.facebook) {
            this.facebook = new FacebookController(ctx.facebook)

          }
          break;

        case 'instagram':
          if (!!ctx.instagram) {
            this.instagram = new InstagramController(ctx.instagram)
          }
          break;

        case 'twitter':
          if (!!ctx.twitter) {
            this.twitter = new TwitterController(ctx.twitter)
          }
          break;

        default:
          break;
      }
    });
  }
}


export default InterfaceController
