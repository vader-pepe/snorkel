import 'dotenv/config'
import Util from "./utils/Utils";
import { DefaultOptions } from "./constants/Constants";
import InterfaceController from "./InterfaceController";
import puppeteer, { Browser, Page } from "puppeteer";
import { EventValues, Events } from "./constants/Events";
import { MyEventEmitter } from './utils/CustomEventEmitter';
import { FacebookController, FacebookEvents } from './facebook/Controller';
import { InstagramController, InstagramEvents } from './instagram/Controller';
import { TwitterController, TwitterEvents } from './twitter/Controller';

type PupBrowser = Browser | null
export type PupPage = Page | null
type Options = typeof DefaultOptions
type Platforms = { facebook: FacebookController, instagram: InstagramController, twitter: TwitterController }
type ClientEvents = {
  [K in EventValues]: (arg: Platforms) => void
} & FacebookEvents & InstagramEvents & TwitterEvents

class Client extends MyEventEmitter<ClientEvents> {
  options: Options
  pupBrowser: PupBrowser
  pupPage: PupPage
  controller: InterfaceController

  constructor(options?: Options) {
    super();

    this.options = Util.mergeDefault(DefaultOptions, options);
    this.pupBrowser = null;
    this.pupPage = null;
    Util.setFfmpegPath(this.options.ffmpegPath);
  }

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
