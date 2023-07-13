import { PuppeteerLaunchOptions, ConnectOptions } from "puppeteer";

type Options = PuppeteerLaunchOptions & ConnectOptions

export const DefaultOptions = {
  puppeteer: {
    headless: true,
    defaultViewport: null,
  } as Options,
  webVersion: '2.2322.15',
  webVersionCache: {
    type: 'local',
  },
  authTimeoutMs: 0,
  takeoverOnConflict: false,
  takeoverTimeoutMs: 0,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
  ffmpegPath: 'ffmpeg',
  bypassCSP: false,
  proxyAuthentication: undefined,
};

export const Events = {
  READY: 'ready',
}
