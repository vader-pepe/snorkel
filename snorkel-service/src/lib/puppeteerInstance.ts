import puppeteer, { PuppeteerLaunchOptions } from "puppeteer"
import path from "path"

const userDataDir = path.resolve('./userData')

async function puppeteerInstance(config?: PuppeteerLaunchOptions) {
  const ISPRODUCTION = process.env.NODE_ENV === 'production'
  const browser = await puppeteer.launch({
    headless: ISPRODUCTION,
    userDataDir,
    ...config
  });
  return browser
}

export default puppeteerInstance
