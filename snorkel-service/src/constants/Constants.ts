import path from "path";
import { ConnectOptions, PuppeteerLaunchOptions } from "puppeteer";

const userDataDir = path.resolve('./userDataDir')

export const defaultOptions = {
  puppeteer: {
    headless: 'new',
    defaultViewport: null,
    userDataDir,
    // required for video. chromium from 
    // puppeteer sucks
    executablePath: '/usr/bin/google-chrome-stable',
    protocolTimeout: 0
  } as PuppeteerLaunchOptions,
  connectOpts: {} as ConnectOptions,
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

export type DefaultOptionsIF = typeof defaultOptions
