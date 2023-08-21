import { KnownDevices, Page, Protocol } from "puppeteer-core";
import { readFile } from "fs/promises";
import path from "path";

import { FacebookController } from "./facebook/Controller";
import { InstagramController } from "./instagram/Controller";
import { TwitterController } from "./twitter/Controller";
import config from "./config";
const root = path.resolve('./src')

const pixel5 = KnownDevices['Pixel 5']
const { platforms } = config

interface CookieCollection {
  facebook: Array<Protocol.Network.CookieParam>
  instagram: Array<Protocol.Network.CookieParam>
  twitter: Array<Protocol.Network.CookieParam>
}

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
      const cookieRaw = await readFile(`${root}/users.json`, 'utf8').catch(() => { throw new Error('No Cookie!') })
      const cookie = JSON.parse(cookieRaw) as unknown as CookieCollection

      switch (platform) {
        case 'https://www.facebook.com/':
          await page.setCookie(...cookie.facebook)
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win32; x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36')
          await page.goto(platform, {
            waitUntil: 'load'
          })
          this.facebook = new FacebookController(page)
          console.log('facebook instance created')
          break;

        case 'https://www.instagram.com/':
          await page.setCookie(...cookie.instagram)
          await page.setUserAgent('Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
          this.instagram = new InstagramController(page)
          await page.goto(platform, {
            waitUntil: 'load'
          })
          console.log('instagram instance created')
          break;

        case 'https://twitter.com/':
          await page.setCookie(...cookie.twitter)
          await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36')
          await page.emulate(pixel5)
          await page.goto(platform, {
            waitUntil: 'load'
          })
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
