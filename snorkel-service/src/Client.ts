import { EventEmitter } from "stream";
import Util from "./utils/Utils";
import { DefaultOptions, Events } from "./constants/Constants";
import puppeteer, { Browser, HTTPResponse, Page } from "puppeteer";
import 'dotenv/config'

type PupBrowser = Browser | null
type PupPage = Page | null
type Options = typeof DefaultOptions

class Client extends EventEmitter {
  options: Options
  pupBrowser: PupBrowser
  pupPage: PupPage
  platforms: {
    site: string,
    instance: HTTPResponse | null
  }[]

  constructor(options: Options) {
    super();

    this.options = Util.mergeDefault(DefaultOptions, options);
    this.pupBrowser = null;
    this.pupPage = null;


  }


  /**
 * Sets up events and requirements, kicks off authentication request
 */
  async initialize(): Promise<void> {
    let browser: PupBrowser
    let page: PupPage

    const puppeteerOpts = this.options.puppeteer;

    if (puppeteerOpts && puppeteerOpts.browserWSEndpoint) {
      browser = await puppeteer.connect(puppeteerOpts);
      page = await browser.newPage();
    } else {
      const browserArgs = [...(puppeteerOpts.args || [])];
      if (!browserArgs.find(arg => arg.includes('--user-agent'))) {
        browserArgs.push(`--user-agent=${this.options.userAgent}`);
      }

      browser = await puppeteer.launch({ ...puppeteerOpts, args: browserArgs });
      page = (await browser.pages())[0];
    }

    await page.setUserAgent(this.options.userAgent);
    if (this.options.bypassCSP) await page.setBypassCSP(true);

    this.pupBrowser = browser;
    this.pupPage = page;

    for (let i = 0; i < this.platforms.length; i++) {
      this.platforms[i].instance = await page.goto(this.platforms[i].site, {
        waitUntil: 'load',
        timeout: 0,
        referer: 'https://whatsapp.com/'
      });
    }

    this.emit(Events.READY);

  }

}

export default Client
