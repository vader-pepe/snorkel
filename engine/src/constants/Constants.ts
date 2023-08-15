import path from "path";
import { ConnectOptions, PuppeteerLaunchOptions } from "puppeteer-core";

const userDataDir = path.resolve('./userDataDir')

export const defaultOptions: DefaultOptionsIF = {
  puppeteer: {
    headless: 'new',
    defaultViewport: null,
    userDataDir,
    protocolTimeout: 0,
    executablePath: ''
  },
  webVersion: '2.2322.15',
  webVersionCache: {
    type: 'local',
  },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  ffmpegPath: 'ffmpeg',
  bypassCSP: false,
  proxyAuthentication: undefined,
};

export interface DefaultOptionsIF {
  puppeteer: PuppeteerLaunchOptions & {
    executablePath: string,
  }
  connectOpts?: ConnectOptions
  webVersion?: string;
  webVersionCache?: {
    type: 'local';
  };
  userAgent?: string;
  ffmpegPath?: string;
  bypassCSP?: boolean;
  proxyAuthentication?: undefined;
}
