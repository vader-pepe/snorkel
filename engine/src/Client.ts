import { Browser, Page } from "puppeteer-core"
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import fs from "fs/promises"

import { DefaultOptionsIF, defaultOptions } from "./constants/Constants";
import InterfaceController from "./InterfaceController";
import { EventValues, Events } from "./constants/Events";
import { MyEventEmitter } from './utils/CustomEventEmitter';
import { FacebookController } from './facebook/Controller';
import { InstagramController } from './instagram/Controller';
import { TwitterController } from './twitter/Controller';
import Util from "./utils/Utils";

type PupBrowser = Browser
export type PupPage = Page
type Platforms = { facebook: FacebookController, instagram: InstagramController, twitter: TwitterController }
type ClientEvents = {
  [K in EventValues]: (arg: Platforms) => void
}

class Client extends MyEventEmitter<ClientEvents> {
  options: DefaultOptionsIF
  pupBrowser: PupBrowser
  pupPage: PupPage
  controller: InterfaceController

  constructor(options: DefaultOptionsIF) {
    super();

    this.options = Util.mergeDefault(defaultOptions, options);
  }

  async initialize(): Promise<void> {
    let browser: PupBrowser
    let page: PupPage

    // to mitigate bug https://github.com/puppeteer/puppeteer/issues/10517
    await fs.unlink(`${this.options.puppeteer.userDataDir}/SingletonLock`).catch(() => { /* keep empty */ })

    const puppeteerOpts = this.options.puppeteer;
    const browserConnectOpts = this.options.connectOpts
    puppeteer.use(StealthPlugin())

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
