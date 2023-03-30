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
  const page = await browser.newPage();
  return page
}

export default puppeteerInstance

