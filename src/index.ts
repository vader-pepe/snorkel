import puppeteerInstance from "./puppeteerInstance"
import logger from "./logger"
import { KnownDevices, Page } from "puppeteer"
const iphoneSe = KnownDevices['iPhone SE']
import "dotenv/config"

const facebookSelectors = {
  // disable "Get alerts about unrecognised logins" first
  facebookEmailField: `[type='text'][name='email'][id='email'][data-testid='royal_email']`,
  facebookPassField: `[type='password'][name='pass'][id='pass'][data-testid='royal_pass']`,
  facebookLoginBtn: `[name='login'][data-testid='royal_login_button'][type='submit']`,
  facebookNewPost: `div[aria-label='Create a post'][role='region'] > div > div`,
  facebookNewPostPopup: `div[role='textbox'][spellcheck='true'][tabindex='0'][data-lexical-editor='true'][contenteditable='true']`,
  //TODO: get to automate the input from the web (Desktop version)
  facebookPostBtn: `div[aria-label='Post'][role='button'][tabindex='0']'`,
  // facebook mobile
  mFacebookEmailField: `input#m_login_email[type="email"]`,
  mFacebookPassField: `input#m_login_password[name="pass"][type="password"][data-sigil="password-plain-text-toggle-input"]`,
  mFacebookLoginBtn: `button[name="login"][type="button"]`,
  mFacebookNotNow: `a[role="button"][target="_self"][data-sigil="touchable"]`,
  mFacebookNewPost: `div#MComposer[data-top-of-feed-unit-type="composer"][data-referrer="MComposer"] > div > div > div > div[role="button"]`,
  mFacebookStatusField: `textarea[aria-label="What's on your mind?"][data-sigil="composer-textarea m-textarea-input"]`,
  mFacebookPhotoBtn: `button[data-sigil="touchable hidden-button photo-button"][type="button"]`,
  mFacebookPostBtn: `div > button[type="submit"][value="Post"][data-sigil="touchable submit_composer"]`,
}

const pikaSelectoors = {
  // img generator pika.style
  pikaTweetUrl: `input[placeholder="Paste tweet URL and hit enter"]`,
  pikaCanvasSize: `button[variant="side"]`,
  // use selectorAll to this selector
  pikaAllPopups: `div[type="button"][aria-haspopup="dialog"][data-state="closed"]`,
  // use parentElement.parentElement to get their button
  pikaTweetCanvas: `img[alt="Tweet"]`,
  pikaInstaCanvas: `img[alt="Insta Post"]`,
  // pikaAllPopups[0] ==> text alignment
  // pikaAllPopups[2] ==> background color //premium
  // pikaAllPopups[3] ==> text color //premium
  // pikaAllPopups[5] ==> canvas options
  // pikaAllPopups[6] ==> background type
  // pikaAllPopups[7] ==> pattern
  pikaBgOptions: `div[role="tablist"][aria-orientation="horizontal"][tabindex="0"][data-orientation="horizontal"]`,
  // pikaBgOptions.children[0] ==> Gradient
  // pikaBgOptions.children[1] ==> Solid
  pikaGradientsParent: `div[class="grid flex-wrap grid-cols-8 gap-[1px] relative overflow-hidden rounded-lg shadow"]`,
  // pikaGradientsParent ==> parent of 16 different gradients
  pikaGradientDirections: `div[class="grid grid-cols-8 gap-x-2 overflow-auto text-xs snap-x max-w-full w-full sizes-wrapper"]`,
  // pikaGradientDirections ==> parent of 8 different directions
  pikaSolidsParent: `div[class="grid flex-wrap grid-cols-8 gap-[1px] relative shadow overflow-hidden rounded-xl"]`,
  // pikaSolidsParent ==> parent of 8 different solid color
  pikaPatterns: `div[class="flex flex-col dark:border-gray-700/80 border-r border-gray-200 max-h-[300px] overflow-y-auto overscroll-none px-2 py-2 bg-gradient-to-br from-red-300/20 to-yellow-100/10 dark:from-gray-800/70 dark:to-gray-900 space-y-2"]`,
  // pikaPatterns.children[1] ==> circle
  // pikaPatterns.children[2] ==> waves
  pikaSaveBtn: `div[class="dark:bg-gray-900/70 dark:border-gray-800 py-2 border-t border-gray-200 w-full md:sticky fixed bottom-0 left-0 z-[10] md:z-0 bg-white backdrop-blur-lg md:rounded-b-xl px-4 pb-4 md:py-2 flex items-center"]`,
  // pikaSaveBtn.children[1].children[1].children[0] ==> PNG
  // pikaSaveBtn.children[1].children[1].children[1] ==> JPG
}

const USERNAME = process.env.USERNAME as string
const PASSWORD = process.env.PASSWORD as string

async function isFacebookLoggedIn(page: Page) {
  const isLoggedIn = await page.evaluate((selector) => {
    const emailField = document.querySelector(selector)
    if (!!emailField) {
      return false
    }
    return true
  }, facebookSelectors.mFacebookEmailField)
  if (isLoggedIn) {
    logger.info("User already logged in")
    return true
  }

  logger.info("User is not logged in. Logging in now")
  await page.type(facebookSelectors.mFacebookEmailField, USERNAME, { delay: 100 })
  await page.type(facebookSelectors.mFacebookPassField, PASSWORD, { delay: 100 })
  await page.waitForSelector(facebookSelectors.mFacebookLoginBtn),

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'domcontentloaded'
      }),
      page.click(facebookSelectors.mFacebookLoginBtn)
    ])

  await page.evaluate((selector) => {
    const notNow = document.querySelector(selector) as HTMLButtonElement
    if (!!notNow) {
      notNow.click()
    }
  }, facebookSelectors.mFacebookNotNow)

  return true
}

async function facebookNewTextStatus(page: Page, newStatus = 'test from snorkel') {

  await page.waitForSelector(facebookSelectors.mFacebookNewPost)

  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    }),
    page.click(facebookSelectors.mFacebookNewPost)
  ])

  await page.type(facebookSelectors.mFacebookStatusField, newStatus, { delay: 100 })
  // weird Facebook behaviour
  await page.evaluate((selector) => {
    let btn = document.querySelector(selector) as HTMLButtonElement
    btn.click()
  }, facebookSelectors.mFacebookPostBtn)

  // dialog leaving Facebook will appear for no reason
  page.on('dialog', async dialog => {
    console.log(dialog.type());
    console.log(dialog.message());
    await dialog.dismiss();
  });

  logger.info("Successfully post a status")
}

async function createTwtImage(page: Page) {
  const browser = page.browser()
  const newTab = await browser.newPage()
  try {
    await newTab.goto('https://pika.style/templates/tweet-image')

  } catch (error: any) {
    logger.error(error?.message)
  }
}

async function facebookNewMediaStatus(page: Page) {
  // const [fileChooser] = await Promise.all([
  // page.waitForFileChooser(),
  // page.click(selectors.mFacebookPhotoBtn),
  // ]);
  // await fileChooser.accept(['../1.png']);

  createTwtImage(page)
}

async function facebookFlow() {
  const page = await puppeteerInstance()
  try {
    await page.emulate(iphoneSe)
    await page.goto('https://www.facebook.com', {
      waitUntil: 'domcontentloaded'
    });

    isFacebookLoggedIn(page)
    // facebookNewTextStatus(page)
    facebookNewMediaStatus(page)
  } catch (error: any) {
    const errorMsg = error?.message as string
    logger.error(errorMsg)
  }
}

facebookFlow()
