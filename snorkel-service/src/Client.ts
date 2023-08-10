import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";
import fs from "fs/promises"

import Util from "./utils/Utils";
import { defaultOptions } from "./constants/Constants";
import InterfaceController from "./InterfaceController";
import { EventValues, Events } from "./constants/Events";
import { MyEventEmitter } from './utils/CustomEventEmitter';
import { FacebookController } from './facebook/Controller';
import { InstagramController } from './instagram/Controller';
import { TwitterController } from './twitter/Controller';
const userDataDir = path.resolve('./userDataDir')

type PupBrowser = Browser | null
export type PupPage = Page | null
type Options = typeof defaultOptions
type Platforms = { facebook: FacebookController, instagram: InstagramController, twitter: TwitterController }
type ClientEvents = {
  [K in EventValues]: (arg: Platforms) => void
}

class Client extends MyEventEmitter<ClientEvents> {
  options: Options
  pupBrowser: PupBrowser
  pupPage: PupPage
  controller: InterfaceController

  constructor(options?: Options) {
    super();

    this.options = Util.mergeDefault(defaultOptions, options);
    this.pupBrowser = null;
    this.pupPage = null;
    Util.setFfmpegPath(this.options.ffmpegPath);
  }

  async initialize(): Promise<void> {
    let browser: PupBrowser
    let page: PupPage

    // to mitigate bug https://github.com/puppeteer/puppeteer/issues/10517
    await fs.unlink(`${userDataDir}/SingletonLock`).catch(() => { })

    const puppeteerOpts = this.options.puppeteer;
    const browserConnectOpts = this.options.connectOpts

    if (browserConnectOpts && browserConnectOpts.browserWSEndpoint) {
      browser = await puppeteer.connect(browserConnectOpts);
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
    this.controller = new InterfaceController(page)
    await this.controller.init()
    // remove first empty page for saving
    await page.close()

    /**
     * Emitted when the client has initialized and is ready.
     * @event Client#ready
     */
    this.emit(Events.READY, { facebook: this.controller.facebook, twitter: this.controller.twitter, instagram: this.controller.instagram });
  }
}

export default Client
