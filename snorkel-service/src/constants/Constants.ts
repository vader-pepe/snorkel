import { PuppeteerLaunchOptions, ConnectOptions } from "puppeteer";

type Options = PuppeteerLaunchOptions & ConnectOptions

export const DefaultOptions = {
  puppeteer: {
    headless: false,
    defaultViewport: null,
  } as Options,
  webVersion: '2.2322.15',
  webVersionCache: {
    type: 'local',
  },
  authTimeoutMs: 0,
  takeoverOnConflict: false,
  takeoverTimeoutMs: 0,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  ffmpegPath: 'ffmpeg',
  bypassCSP: false,
  proxyAuthentication: undefined,
};
