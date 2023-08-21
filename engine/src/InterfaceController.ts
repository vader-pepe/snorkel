import { KnownDevices, Page } from "puppeteer-core";
import { FacebookController } from "./facebook/Controller";
import { InstagramController } from "./instagram/Controller";
import { TwitterController } from "./twitter/Controller";
import config from "./config";

const pixel5 = KnownDevices['Pixel 5']
const { platforms } = config

export type IPlatfroms =
  'https://www.instagram.com/' |
  'https://www.facebook.com/' |
  'https://twitter.com/'


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
      if (platform !== 'https://www.instagram.com/') {
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36')
        await page.emulate(pixel5)
      } else {
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
      }
      await page.goto(platform, {
        waitUntil: 'domcontentloaded'
      })

      switch (platform) {
        case 'https://www.facebook.com/':
          this.facebook = new FacebookController(page)
          console.log('facebook instance created')
          break;

        case 'https://www.instagram.com/':
          this.instagram = new InstagramController(page)
          console.log('instagram instance created')
          break;

        case 'https://twitter.com/':
          this.twitter = new TwitterController(page)
          console.log('twitter instance created')
          break;

        default:
          break;
      }
    }))
  }
}


export default InterfaceController
